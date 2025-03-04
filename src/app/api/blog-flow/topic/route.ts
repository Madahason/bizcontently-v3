import { StreamingTextResponse } from "ai";
import Anthropic from "@anthropic-ai/sdk";
import { generateTopicPrompt } from "@/lib/blog-flow/prompts/topicPrompts";
import {
  TopicGenerationParams,
  TopicIdea,
  SerpData,
} from "@/lib/blog-flow/types/generation";
import { fetchSerpData } from "@/lib/blog-flow/utils/serpApi";

// Create Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Helper function to check topic relevance
function validateTopicRelevance(topic: TopicIdea, mainTopic: string): boolean {
  const mainKeywords = mainTopic.toLowerCase().split(" ");
  const titleContainsMainTopic = mainKeywords.some((keyword) =>
    topic.title.toLowerCase().includes(keyword)
  );
  const descriptionContainsMainTopic = mainKeywords.some((keyword) =>
    topic.description.toLowerCase().includes(keyword)
  );
  const keywordsContainMainTopic = topic.targetKeywords.some((keyword) =>
    mainKeywords.some((mainKeyword) =>
      keyword.toLowerCase().includes(mainKeyword)
    )
  );

  return (
    titleContainsMainTopic &&
    descriptionContainsMainTopic &&
    keywordsContainMainTopic
  );
}

// Helper function to enhance topics with SERP data
async function enhanceTopicsWithSerpData(
  topics: TopicIdea[],
  mainTopic: string
): Promise<TopicIdea[]> {
  try {
    const serpData = await fetchSerpData(mainTopic);
    if (!serpData) return topics;

    return topics.map((topic) => ({
      ...topic,
      competitorInsights: {
        ...topic.competitorInsights,
        topResults: serpData.organicResults.slice(0, 5),
        featuredSnippets: serpData.featuredSnippets,
        relatedSearches: serpData.relatedSearches,
      },
    }));
  } catch (error) {
    console.error("Error enhancing topics with SERP data:", error);
    return topics;
  }
}

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const params: TopicGenerationParams = await req.json();

    if (!params.mainTopic) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Main topic is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Generate the prompt using our template
    const prompt = generateTopicPrompt(params);

    console.log("Sending request to Anthropic with params:", {
      mainTopic: params.mainTopic,
      niche: params.niche,
      targetAudience: params.targetAudience,
    });

    try {
      // Create the completion without streaming
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        temperature: 0.7,
        system: `You are an expert content strategist and SEO specialist. 
Always respond in valid JSON format.
Every generated topic must directly relate to the main topic.
Ensure high relevance and exact keyword matching in titles and descriptions.
Never generate off-topic or tangentially related content.`,
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
        console.error("No text content in response:", response);
        throw new Error("No text content in response");
      }

      try {
        // Parse and validate the response
        const parsed = JSON.parse(content.text);

        if (!parsed.topics || !Array.isArray(parsed.topics)) {
          console.error("Invalid response format:", content.text);
          throw new Error(
            "Invalid response format: missing or invalid topics array"
          );
        }

        // Validate each topic has required fields
        const validateTopic = (topic: any): topic is TopicIdea => {
          return (
            typeof topic === "object" &&
            typeof topic.title === "string" &&
            typeof topic.description === "string" &&
            Array.isArray(topic.targetKeywords) &&
            typeof topic.estimatedWordCount === "number" &&
            typeof topic.difficulty === "string" &&
            typeof topic.competitorInsights === "object" &&
            typeof topic.competitorInsights.averageWordCount === "number" &&
            Array.isArray(topic.competitorInsights.commonSubtopics) &&
            Array.isArray(topic.competitorInsights.keywordGaps)
          );
        };

        const validationResults = parsed.topics.map((topic: any) => {
          try {
            if (!validateTopic(topic)) {
              return {
                valid: false,
                error: "Missing required fields or invalid field types",
                topic,
              };
            }
            return { valid: true, topic };
          } catch (e) {
            return {
              valid: false,
              error: e instanceof Error ? e.message : "Invalid topic format",
              topic,
            };
          }
        });

        interface ValidationResult {
          valid: boolean;
          error?: string;
          topic: any;
        }

        const invalidTopics = validationResults.filter(
          (result: ValidationResult) => !result.valid
        );
        if (invalidTopics.length > 0) {
          console.error("Invalid topics found:", invalidTopics);
          throw new Error(
            `Invalid topic format: ${invalidTopics
              .map((t: ValidationResult) => t.error)
              .join(", ")}`
          );
        }

        // Filter out any topics that don't meet relevance criteria
        let validTopics = validationResults
          .map((result: ValidationResult) => result.topic)
          .filter((topic: TopicIdea) =>
            validateTopicRelevance(topic, params.mainTopic)
          );

        console.log(
          `Generated ${parsed.topics.length} topics, ${validTopics.length} valid`
        );

        // If we have fewer than 5 relevant topics, regenerate
        if (validTopics.length < 5) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Not enough relevant topics generated. Please try again.",
              debug: {
                totalTopics: parsed.topics.length,
                validTopics: validTopics.length,
              },
            }),
            {
              status: 422,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }

        // Enhance topics with SERP data if requested
        if (params.includeSerpData) {
          validTopics = await enhanceTopicsWithSerpData(
            validTopics,
            params.mainTopic
          );
        }

        // Return the validated and enhanced topics
        return new Response(
          JSON.stringify({
            success: true,
            topics: validTopics,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (parseError) {
        console.error(
          "Failed to parse response:",
          parseError,
          "\nContent:",
          content.text
        );
        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed to parse the generated topics. Please try again.",
            debug: {
              errorType:
                parseError instanceof Error
                  ? parseError.name
                  : typeof parseError,
              errorMessage:
                parseError instanceof Error
                  ? parseError.message
                  : String(parseError),
            },
          }),
          {
            status: 422,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (anthropicError) {
      console.error("Anthropic API error:", anthropicError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Error communicating with AI service. Please try again.",
          debug: {
            errorType:
              anthropicError instanceof Error
                ? anthropicError.name
                : typeof anthropicError,
            errorMessage:
              anthropicError instanceof Error
                ? anthropicError.message
                : String(anthropicError),
          },
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to process your request. Please try again.",
        debug: {
          errorType: error instanceof Error ? error.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
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
