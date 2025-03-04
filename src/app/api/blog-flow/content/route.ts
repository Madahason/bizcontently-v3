import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { generateContentPrompt } from "@/lib/blog-flow/prompts/contentPrompts";
import {
  BlogContentGenerationParams,
  BlogContentGenerationResponse,
  BlogContentSection,
} from "@/lib/blog-flow/types/generation";
import {
  findRelevantLinks,
  insertLinks,
  formatSectionWithLinks,
} from "@/lib/blog-flow/utils/textAnalysis";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const params: BlogContentGenerationParams = await req.json();

    // Validate input parameters
    if (
      !params.outline ||
      !params.outline.sections ||
      !Array.isArray(params.outline.sections)
    ) {
      throw new Error("Invalid outline structure provided");
    }

    const prompt = generateContentPrompt(params);

    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the content from the first message block
    const content = response.content.find(
      (block) => block.type === "text"
    )?.text;

    if (!content) {
      throw new Error("No content received from Anthropic");
    }

    // Try to parse the content as JSON, removing any potential non-JSON text
    const jsonContent = content.substring(
      content.indexOf("{"),
      content.lastIndexOf("}") + 1
    );

    let parsedContent: BlogContentGenerationResponse;
    try {
      parsedContent = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse content as JSON:", parseError);
      console.error("Raw content:", content);
      throw new Error("Invalid JSON response from Anthropic");
    }

    // Validate the parsed content has the required structure
    if (!parsedContent.sections || !Array.isArray(parsedContent.sections)) {
      console.error("Invalid content structure:", parsedContent);
      throw new Error("Invalid content structure: missing sections array");
    }

    // Process sections to add headings and external links
    const enhancedSections = await Promise.all(
      parsedContent.sections.map(async (section, index) => {
        try {
          if (!section.content || typeof section.content !== "string") {
            throw new Error(`Invalid section content for section ${index}`);
          }

          // Format content with proper heading and add relevant links
          const formattedContent = await formatSectionWithLinks(
            section,
            index === 0 ? 1 : 2 // First section is h1, rest are h2
          );

          return {
            ...section,
            content: formattedContent,
          };
        } catch (error) {
          console.error(`Error processing section ${section.id}:`, error);
          // Return the original section if enhancement fails
          return section;
        }
      })
    );

    const enhancedContent = {
      ...parsedContent,
      sections: enhancedSections,
    };

    return new NextResponse(JSON.stringify(enhancedContent), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[CONTENT_ERROR]", error);
    // Include more detailed error information in development
    const errorMessage =
      process.env.NODE_ENV === "development"
        ? error instanceof Error
          ? `${error.message}\n${error.stack}`
          : "Failed to generate content"
        : "Failed to generate content";

    return new NextResponse(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
