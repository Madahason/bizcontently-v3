import { TopicGenerationParams } from "../types/generation";

export const generateTopicPrompt = ({
  mainTopic,
  niche,
  targetAudience,
  contentLength = "medium",
  difficulty = "intermediate",
}: TopicGenerationParams): string => {
  const audienceContext = targetAudience
    ? `The target audience is ${targetAudience}.`
    : "";

  const nicheContext = niche ? `within the ${niche} niche` : "";

  const wordCountGuide =
    {
      short: "800-1200",
      medium: "1500-2500",
      long: "3000-4000",
    }[contentLength] || "1500-2500";

  // Extract main keywords from the topic
  const mainKeywords = mainTopic
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 2)
    .join(", ");

  return `As an expert content strategist, analyze the topic "${mainTopic}" ${nicheContext} and generate 5 highly relevant blog post ideas. ${audienceContext}

Key Focus:
- The main topic keywords to focus on are: ${mainKeywords}
- Each generated title and content MUST directly relate to "${mainTopic}"
- Ensure the main topic appears prominently in titles and descriptions
- Maintain topical relevance throughout all suggestions

Content Requirements:
- Content difficulty: ${difficulty}
- Target word count range: ${wordCountGuide} words
- Each topic must be a unique angle on "${mainTopic}"
- Focus on search intent specifically related to ${mainTopic}
- Topics must be thoroughly covered within the word count range

For each topic suggestion, provide a structured analysis including:
1. A compelling title that:
   - Includes "${mainTopic}" or its close variants
   - Balances SEO with readability
   - Clearly indicates the specific value proposition
2. A focused description that:
   - Directly addresses "${mainTopic}"
   - Explains the unique perspective
   - Demonstrates clear value to the reader
3. Strategic target keywords that:
   - Include "${mainTopic}" and its variations
   - Feature relevant long-tail keywords
   - Match user search intent
4. Estimated optimal word count based on topic complexity
5. Competitor insights specifically for "${mainTopic}":
   - Average content length of top-ranking posts
   - Common subtopics in existing content
   - Gaps in current coverage

Format your response as a valid JSON object with this exact structure:
{
  "topics": [
    {
      "title": "string (must include '${mainTopic}' or close variant)",
      "description": "string (must clearly relate to '${mainTopic}')",
      "targetKeywords": ["string (must include main topic keywords)"],
      "difficulty": "${difficulty}",
      "estimatedWordCount": number,
      "competitorInsights": {
        "averageWordCount": number,
        "commonSubtopics": ["string (must relate to '${mainTopic}')"],
        "keywordGaps": ["string (must be relevant to '${mainTopic}')"]
      }
    }
  ]
}

Quality Checks:
- Each title must contain "${mainTopic}" or a very close variant
- All descriptions must directly address "${mainTopic}"
- Keywords must include "${mainTopic}" and related terms
- Every suggestion must maintain clear relevance to the main topic
- Content must provide unique value while staying focused on the topic`;
};
