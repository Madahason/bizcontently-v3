import { OutlineGenerationParams } from "../types/generation";

// Style guides for different content types
const styleGuides = {
  academic: {
    tone: "formal and research-based",
    sections: [
      "Abstract",
      "Introduction",
      "Literature Review",
      "Methodology",
      "Results",
      "Discussion",
      "Conclusion",
    ],
  },
  conversational: {
    tone: "friendly and engaging",
    sections: ["Hook", "Context", "Main Points", "Examples", "Takeaways"],
  },
  tutorial: {
    tone: "instructional and step-by-step",
    sections: [
      "Overview",
      "Prerequisites",
      "Steps",
      "Common Issues",
      "Next Steps",
    ],
  },
  listicle: {
    tone: "concise and scannable",
    sections: ["Introduction", "List Items", "Summary", "Resources"],
  },
};

// Keyword density and placement strategies
const keywordStrategies = {
  aggressive: {
    density: "3-4%",
    placement:
      "Every 100-150 words, prioritizing headers and first/last paragraphs",
  },
  balanced: {
    density: "1.5-2.5%",
    placement: "Natural distribution with focus on headers and key paragraphs",
  },
  conservative: {
    density: "0.5-1.5%",
    placement: "Strategic placement in headers and topic sentences only",
  },
};

export const generateOutlinePrompt = ({
  selectedTopic,
  style = "conversational",
  depth = 2,
  includeIntroConclusion = true,
  includeFAQ = true,
  keywordStrategy = "balanced",
}: OutlineGenerationParams): string => {
  if (!selectedTopic) {
    throw new Error("Selected topic is required");
  }

  const styleGuide = styleGuides[style] || styleGuides.conversational;
  const keywordGuide =
    keywordStrategies[keywordStrategy] || keywordStrategies.balanced;

  // Ensure all required properties exist with defaults
  const {
    title = "",
    description = "",
    targetKeywords = [],
    difficulty = "intermediate",
    estimatedWordCount = 1500,
    competitorInsights = {
      recommendedWordCount: estimatedWordCount,
      averageWordCount: estimatedWordCount,
      keywordDensity: {},
      averageHeadings: 0,
      commonSubtopics: [],
      keywordGaps: [],
    },
  } = selectedTopic;

  // Safely extract competitor insights with defaults
  const {
    recommendedWordCount = estimatedWordCount,
    averageWordCount = estimatedWordCount,
    commonSubtopics = [],
    keywordGaps = [],
  } = competitorInsights;

  return `As an expert content strategist, create a detailed outline for an article about "${title}" that will outperform the current top-ranking content.

Content Parameters:
- Target word count: ${recommendedWordCount} (competitor average: ${averageWordCount})
- Content style: ${style} (${styleGuide.tone})
- Keyword strategy: ${keywordStrategy} (density: ${keywordGuide.density})
- Maximum heading depth: h${depth}
- Include introduction and conclusion: ${includeIntroConclusion}
- Include FAQ section: ${includeFAQ}

Topic Analysis:
1. Main Topic: ${title}
2. Description: ${description}
3. Target Keywords: ${targetKeywords.join(", ")}
4. Difficulty Level: ${difficulty}

${
  commonSubtopics && commonSubtopics.length > 0
    ? `\nCommon Subtopics to Cover:\n${commonSubtopics
        .map((topic: string) => `- ${topic}`)
        .join("\n")}`
    : ""
}

${
  keywordGaps && keywordGaps.length > 0
    ? `\nContent Gaps to Address:\n${keywordGaps
        .map((gap: string) => `- ${gap}`)
        .join("\n")}`
    : ""
}

Content Requirements:
1. Each section must:
   - Include SEO-optimized headings
   - Cover topics comprehensively
   - Address identified content gaps
   - Include unique insights
   - Maintain proper keyword density and placement

2. Keyword Integration:
   - Primary keywords: ${keywordGuide.placement}
   - Use semantic variations
   - Target identified gaps

3. Structure Guidelines:
   - Follow enhanced ${style} format: ${styleGuide.sections.join(" → ")}
   - Ensure logical flow and comprehensive coverage
   - Include detailed transition suggestions
   ${
     includeFAQ ? "- End with expert FAQ section addressing common queries" : ""
   }

IMPORTANT: Your response must be a valid JSON object with this EXACT structure:

{
  "title": "${title}",
  "introduction": "Brief introduction to the topic",
  "sections": [
    {
      "id": "section-1",
      "title": "Introduction to [Topic]",
      "type": "h1",
      "content": "Comprehensive overview addressing [key points]",
      "keyPoints": [
        "Unique insight 1",
        "Gap analysis point",
        "Competitor differentiator"
      ],
      "recommendedWordCount": 300,
      "keywords": {
        "primary": ["main keyword", "target phrase"],
        "secondary": ["supporting term", "related concept"],
        "semantic": ["variation", "synonym"]
      },
      "children": []
    }
  ],
  "conclusion": "Summary of key points and takeaways",
  "metadata": {
    "estimatedWordCount": ${recommendedWordCount},
    "targetKeywords": ${JSON.stringify(targetKeywords)}
  },
  "seoGuidance": {
    "keywordPlacements": {
      "${targetKeywords[0] || "main-keyword"}": {
        "recommended": 8,
        "sections": ["section-1", "section-2"]
      }
    },
    "contentGaps": ${JSON.stringify(keywordGaps)},
    "competitorInsights": {
      "averageSectionCount": 8,
      "commonHeadings": ${JSON.stringify(commonSubtopics)},
      "missingTopics": ${JSON.stringify(keywordGaps)}
    }
  }
}

Quality Checks:
- Each section must be detailed and comprehensive
- Word count must meet or exceed the target
- Address all identified content gaps
- Include unique insights
- Maintain proper keyword distribution
- Ensure all required fields are present and properly typed
- Validate that all IDs are unique
- Sections should add up to the target word count`;
};

export const generateOutlineCustomizationPrompt = (
  currentOutline: string,
  customization: string
): string => {
  return `As an expert content strategist, modify the following outline based on the customization request.

Current Outline:
${currentOutline}

Customization Request:
${customization}

Apply the changes while maintaining:
1. SEO optimization of headings and structure
2. Logical flow and hierarchy
3. Appropriate keyword distribution
4. Word count balance

Return the modified outline in the same JSON structure as the input.`;
};
