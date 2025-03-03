import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  BlogContentGenerationParams,
  BlogContentGenerationResponse,
  BlogContentSection,
} from "@/lib/blog-flow/types/generation";
import { generateContentPrompt } from "@/lib/blog-flow/prompts/contentPrompts";

// Create Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Helper function to validate content section
function validateContentSection(section: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!section.id || typeof section.id !== "string") {
    errors.push("Missing or invalid section ID");
  }
  if (!section.content || typeof section.content !== "string") {
    errors.push("Missing or invalid content");
  }
  if (typeof section.wordCount !== "number") {
    errors.push("Missing or invalid word count");
  }
  if (!section.keywordDensity || typeof section.keywordDensity !== "object") {
    errors.push("Missing or invalid keyword density");
  }
  if (typeof section.readabilityScore !== "number") {
    errors.push("Missing or invalid readability score");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper function to validate content response
function validateContent(content: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // Validate sections
    if (!Array.isArray(content.sections)) {
      errors.push("Sections must be an array");
    } else {
      content.sections.forEach((section: any, index: number) => {
        const sectionValidation = validateContentSection(section);
        if (!sectionValidation.isValid) {
          errors.push(
            `Section ${index} errors: ${sectionValidation.errors.join(", ")}`
          );
        }
      });
    }

    // Validate metadata
    if (!content.metadata || typeof content.metadata !== "object") {
      errors.push("Missing or invalid metadata");
    } else {
      const metadata = content.metadata;
      if (typeof metadata.totalWordCount !== "number") {
        errors.push("Missing or invalid total word count");
      }
      if (typeof metadata.averageReadabilityScore !== "number") {
        errors.push("Missing or invalid average readability score");
      }
      if (
        !metadata.keywordDensityOverall ||
        typeof metadata.keywordDensityOverall !== "object"
      ) {
        errors.push("Missing or invalid overall keyword density");
      }
      if (typeof metadata.seoScore !== "number") {
        errors.push("Missing or invalid SEO score");
      }
      if (
        !metadata.contentQualityMetrics ||
        typeof metadata.contentQualityMetrics !== "object"
      ) {
        errors.push("Missing or invalid content quality metrics");
      }
    }

    // Validate SEO analysis
    if (!content.seoAnalysis || typeof content.seoAnalysis !== "object") {
      errors.push("Missing or invalid SEO analysis");
    } else {
      const seoAnalysis = content.seoAnalysis;
      if (
        !seoAnalysis.keywordImplementation ||
        typeof seoAnalysis.keywordImplementation !== "object"
      ) {
        errors.push("Missing or invalid keyword implementation");
      }
      if (!Array.isArray(seoAnalysis.contentGapsCovered)) {
        errors.push("Content gaps covered must be an array");
      }
      if (!Array.isArray(seoAnalysis.missingTopics)) {
        errors.push("Missing topics must be an array");
      }
      if (!Array.isArray(seoAnalysis.suggestions)) {
        errors.push("Suggestions must be an array");
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

export async function POST(req: Request) {
  try {
    const params: BlogContentGenerationParams = await req.json();

    if (!params.outline) {
      return NextResponse.json(
        {
          success: false,
          error: "Outline is required",
        },
        { status: 400 }
      );
    }

    try {
      // Generate the prompt
      const prompt = generateContentPrompt(params);

      // Create the completion
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: params.maxTokens || 4000,
        temperature: 0.7,
        system: `You are an expert content writer and SEO specialist.
You must ONLY respond with a valid JSON object.
Do not include any other text, explanations, or markdown formatting.
The JSON structure must exactly match the example provided.
Each field must have the correct type as specified.
Never include any text before or after the JSON object.
Generate high-quality, engaging content that:
- Follows the outline structure exactly
- Implements SEO guidelines naturally
- Maintains consistent style and tone
- Includes proper markdown formatting`,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Get the content from the response
      const content = response.content.find((block) => block.type === "text");
      if (!content || content.type !== "text") {
        throw new Error("No text content in response");
      }

      try {
        // Parse and validate the response
        const parsed = JSON.parse(content.text);
        const validation = validateContent(parsed);

        if (!validation.isValid) {
          console.error("Content validation errors:", validation.errors);
          return NextResponse.json(
            {
              success: false,
              error: "Invalid content structure",
              validationErrors: validation.errors,
            },
            { status: 422 }
          );
        }

        // Return the validated content
        return NextResponse.json({
          success: true,
          content: parsed,
        });
      } catch (parseError) {
        console.error("Failed to parse content:", parseError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to parse generated content",
            parseError:
              parseError instanceof Error
                ? parseError.message
                : "Unknown error",
          },
          { status: 422 }
        );
      }
    } catch (error) {
      console.error("Content generation error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Error generating content",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process content generation request",
      },
      { status: 500 }
    );
  }
}
