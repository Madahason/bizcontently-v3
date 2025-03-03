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

    if (!params.selectedTopic) {
      return NextResponse.json(
        {
          success: false,
          error: "Selected topic is required",
        },
        { status: 400 }
      );
    }

    try {
      // First, analyze SERP data for the topic
      console.log("Analyzing SERP data for:", params.selectedTopic.title);
      let serpAnalysis;
      try {
        serpAnalysis = await analyzeSerpContent(params.selectedTopic.title);
      } catch (serpError) {
        console.error("SERP analysis error:", serpError);
        // Continue with default values if SERP analysis fails
        serpAnalysis = {
          mainHeadings: [],
          subHeadings: [],
          commonTopics: [],
          wordCounts: {
            average: params.selectedTopic.estimatedWordCount,
            highest: params.selectedTopic.estimatedWordCount,
            recommended: params.selectedTopic.estimatedWordCount * 1.2,
          },
          keyInsights: [],
          uniqueAngles: [],
          contentGaps: [],
        };
      }

      const competitorInsights = generateCompetitorInsights(serpAnalysis);

      // Update the topic with SERP insights
      const enhancedTopic = {
        ...params.selectedTopic,
        estimatedWordCount: Math.max(
          params.selectedTopic.estimatedWordCount,
          competitorInsights.recommendedWordCount
        ),
        competitorInsights: {
          ...params.selectedTopic.competitorInsights,
          ...competitorInsights,
        },
      };

      // Generate the prompt using enhanced topic data
      const prompt = generateOutlinePrompt({
        ...params,
        selectedTopic: enhancedTopic,
      });

      // Log the parameters being sent to Anthropic
      console.log("Sending request to Anthropic with topic:", {
        title: enhancedTopic.title,
        wordCount: enhancedTopic.estimatedWordCount,
        insights: {
          commonTopics: competitorInsights.commonTopics.length,
          contentGaps: competitorInsights.contentGaps.length,
          uniqueAngles: competitorInsights.uniqueAngles.length,
        },
      });

      // Create the completion
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        temperature: 0.7,
        system: `You are an expert content strategist and SEO specialist.
You must ONLY respond with a valid JSON object.
Do not include any other text, explanations, or markdown formatting.
The JSON structure must exactly match the example provided.
Each field must have the correct type as specified.
Never include any text before or after the JSON object.
Create an outline that is more comprehensive than the analyzed competitors:
- Cover all topics found in competitor content
- Address identified content gaps
- Include unique angles not covered by competitors
- Aim for higher word count and depth
- Ensure proper keyword placement and density`,
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
        // Clean up the response text
        const cleanedText = sanitizeResponse(content.text);
        console.log(
          "Cleaned response text:",
          cleanedText.substring(0, 200) + "..."
        );

        // Try to parse the cleaned JSON
        let parsed;
        try {
          parsed = JSON.parse(cleanedText);
        } catch (initialParseError) {
          console.error("Initial parse error:", initialParseError);
          // If initial parse fails, try to fix common JSON issues
          const fixedText = cleanedText
            .replace(/,(\s*[}\]])/g, "$1")
            .replace(/'/g, '"')
            .replace(/\n/g, " ")
            .trim();
          parsed = JSON.parse(fixedText);
        }

        // Validate the parsed response
        const validation = validateOutline(parsed);

        if (!validation.isValid) {
          console.error("Outline validation errors:", validation.errors);
          return NextResponse.json(
            {
              success: false,
              error: "Invalid outline structure",
              validationErrors: validation.errors,
              receivedStructure: parsed,
              debug: {
                serpAnalysisStatus: serpAnalysis ? "success" : "failed",
                topicTitle: params.selectedTopic.title,
                enhancedWordCount: enhancedTopic.estimatedWordCount,
                competitorInsightsAvailable:
                  Object.keys(competitorInsights).length > 0,
              },
            },
            { status: 422 }
          );
        }

        // Add SERP analysis data to the response
        const outlineWithAnalysis = {
          ...parsed,
          serpAnalysis: {
            analyzedResults: serpAnalysis.mainHeadings.length,
            averageCompetitorWordCount: serpAnalysis.wordCounts.average,
            recommendedWordCount: serpAnalysis.wordCounts.recommended,
            uniqueAngles: serpAnalysis.uniqueAngles,
            contentGaps: serpAnalysis.contentGaps,
          },
        };

        // Return the validated outline with SERP analysis
        return NextResponse.json({
          success: true,
          outline: outlineWithAnalysis,
        });
      } catch (parseError) {
        console.error("Failed to parse outline:", parseError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to parse outline response",
            parseError:
              parseError instanceof Error
                ? parseError.message
                : "Unknown error",
            receivedText: content.text.substring(0, 500) + "...",
            cleanedText:
              sanitizeResponse(content.text).substring(0, 500) + "...",
            debug: {
              serpAnalysisStatus: serpAnalysis ? "success" : "failed",
              topicTitle: params.selectedTopic.title,
              enhancedWordCount: enhancedTopic.estimatedWordCount,
              competitorInsightsAvailable:
                Object.keys(competitorInsights).length > 0,
            },
          },
          { status: 422 }
        );
      }
    } catch (error) {
      console.error("SERP analysis or outline generation error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Error analyzing search results or generating outline",
          details: error instanceof Error ? error.message : "Unknown error",
          debug: {
            stage: "outline_generation",
            topicTitle: params.selectedTopic.title,
            errorType: error instanceof Error ? error.name : typeof error,
            errorStack: error instanceof Error ? error.stack : undefined,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process outline generation request",
        requestError: error instanceof Error ? error.message : "Unknown error",
        debug: {
          stage: "request_processing",
          errorType: error instanceof Error ? error.name : typeof error,
          errorStack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 }
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
