import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  OutlineGenerationParams,
  OutlineGenerationResponse,
  OutlineSection,
} from "@/lib/blog-flow/types/generation";
import {
  generateOutlinePrompt,
  generateOutlineCustomizationPrompt,
} from "@/lib/blog-flow/prompts/outlinePrompts";
import {
  analyzeSerpContent,
  generateCompetitorInsights,
} from "@/lib/blog-flow/utils/serpAnalyzer";

// Create Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Helper function to validate section structure
function validateSection(section: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!section.id || typeof section.id !== "string") {
    errors.push("Missing or invalid section ID");
  }
  if (!section.title || typeof section.title !== "string") {
    errors.push("Missing or invalid section title");
  }
  if (!["h1", "h2", "h3", "h4"].includes(section.type)) {
    errors.push(`Invalid section type: ${section.type}`);
  }
  if (!section.content || typeof section.content !== "string") {
    errors.push("Missing or invalid section content");
  }
  if (!Array.isArray(section.keyPoints)) {
    errors.push("Key points must be an array");
  }
  if (typeof section.recommendedWordCount !== "number") {
    errors.push("Recommended word count must be a number");
  }
  if (!section.keywords || !Array.isArray(section.keywords.primary)) {
    errors.push("Keywords must include primary array");
  }

  // Validate children recursively
  if (section.children) {
    if (!Array.isArray(section.children)) {
      errors.push("Children must be an array");
    } else {
      section.children.forEach((child: any, index: number) => {
        const childValidation = validateSection(child);
        if (!childValidation.isValid) {
          errors.push(
            `Child section ${index} errors: ${childValidation.errors.join(
              ", "
            )}`
          );
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper function to validate outline structure
function validateOutline(outline: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // Check basic structure
    if (!outline.sections || !Array.isArray(outline.sections)) {
      errors.push("Missing or invalid sections array");
    }
    if (!outline.metadata || typeof outline.metadata !== "object") {
      errors.push("Missing or invalid metadata object");
    }
    if (!outline.seoGuidance || typeof outline.seoGuidance !== "object") {
      errors.push("Missing or invalid seoGuidance object");
    }

    // Validate each section
    if (outline.sections) {
      outline.sections.forEach((section: any, index: number) => {
        const sectionValidation = validateSection(section);
        if (!sectionValidation.isValid) {
          errors.push(
            `Section ${index} errors: ${sectionValidation.errors.join(", ")}`
          );
        }
      });
    }

    // Validate metadata
    if (outline.metadata) {
      if (typeof outline.metadata.totalWordCount !== "number") {
        errors.push("Metadata must include totalWordCount");
      }
      if (
        !outline.metadata.keywordDensity ||
        typeof outline.metadata.keywordDensity !== "object"
      ) {
        errors.push("Metadata must include keywordDensity object");
      }
      if (typeof outline.metadata.readabilityScore !== "number") {
        errors.push("Metadata must include readabilityScore");
      }
      if (typeof outline.metadata.seoScore !== "number") {
        errors.push("Metadata must include seoScore");
      }
    }

    // Validate SEO guidance
    if (outline.seoGuidance) {
      if (
        !outline.seoGuidance.keywordPlacements ||
        typeof outline.seoGuidance.keywordPlacements !== "object"
      ) {
        errors.push("SEO guidance must include keywordPlacements object");
      }
      if (!Array.isArray(outline.seoGuidance.contentGaps)) {
        errors.push("SEO guidance must include contentGaps array");
      }
      if (
        !outline.seoGuidance.competitorInsights ||
        typeof outline.seoGuidance.competitorInsights !== "object"
      ) {
        errors.push("SEO guidance must include competitorInsights object");
      }
    }
  } catch (error) {
    errors.push(
      `Validation error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper function to extract JSON from text
function extractJSON(text: string): string {
  // Try to find JSON object in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : text;
}

// Helper function to sanitize the response
function sanitizeResponse(text: string): string {
  // Remove any markdown code block syntax
  text = text.replace(/```json\s*|\s*```/g, "");
  // Remove any natural language before or after the JSON
  return extractJSON(text);
}

export async function POST(req: Request) {
  try {
    const params: OutlineGenerationParams = await req.json();

    // Validate input parameters
    if (!params.selectedTopic) {
      throw new Error("No topic selected");
    }

    const prompt = generateOutlinePrompt(params);

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

    let parsedOutline: OutlineGenerationResponse;
    try {
      parsedOutline = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse outline as JSON:", parseError);
      console.error("Raw content:", content);
      throw new Error("Invalid JSON response from Anthropic");
    }

    // Validate the parsed outline has the required structure
    if (!parsedOutline.sections || !Array.isArray(parsedOutline.sections)) {
      console.error("Invalid outline structure:", parsedOutline);
      throw new Error("Invalid outline structure: missing sections array");
    }

    // Add IDs to sections if they don't exist
    const addIds = (sections: any[]): any[] => {
      return sections.map((section) => ({
        ...section,
        id: section.id || crypto.randomUUID(),
        children: section.children ? addIds(section.children) : [],
      }));
    };

    parsedOutline.sections = addIds(parsedOutline.sections);

    return new NextResponse(JSON.stringify(parsedOutline), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[OUTLINE_ERROR]", error);
    // Include more detailed error information in development
    const errorMessage =
      process.env.NODE_ENV === "development"
        ? error instanceof Error
          ? `${error.message}\n${error.stack}`
          : "Failed to generate outline"
        : "Failed to generate outline";

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

export async function PUT(req: Request) {
  try {
    const { outline, customization } = await req.json();

    if (!outline || !customization) {
      return NextResponse.json(
        {
          success: false,
          error: "Both outline and customization are required",
        },
        { status: 400 }
      );
    }

    // Generate customization prompt
    const prompt = generateOutlineCustomizationPrompt(
      JSON.stringify(outline, null, 2),
      customization
    );

    try {
      // Create the completion for customization
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        temperature: 0.7,
        system: `You are an expert content strategist and SEO specialist.
Modify outlines while maintaining SEO optimization and structure.
Always return valid JSON in the same format as the input.
Ensure changes preserve keyword distribution and content quality.`,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.content.find((block) => block.type === "text");
      if (!content || content.type !== "text") {
        throw new Error("No text content in response");
      }

      try {
        const parsed = JSON.parse(content.text);

        if (!validateOutline(parsed)) {
          throw new Error("Invalid outline structure");
        }

        return NextResponse.json({
          success: true,
          outline: parsed,
        });
      } catch (parseError) {
        console.error("Failed to parse customized outline:", parseError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to generate valid customized outline",
          },
          { status: 422 }
        );
      }
    } catch (anthropicError) {
      console.error(
        "Anthropic API error during customization:",
        anthropicError
      );
      return NextResponse.json(
        {
          success: false,
          error: "Error customizing outline. Please try again.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process outline customization request",
      },
      { status: 500 }
    );
  }
}
