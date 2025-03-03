import { OutlineGenerationParams } from "../types/generation";

const styleGuides = {
  academic: {
    structure: "formal, research-based, with clear methodology",
    tone: "scholarly, objective, analytical",
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
    structure: "flowing, engaging, with personal insights",
    tone: "friendly, approachable, relatable",
    sections: [
      "Hook",
      "Personal Story",
      "Main Points",
      "Examples",
      "Takeaways",
    ],
  },
  tutorial: {
    structure: "step-by-step, with clear instructions",
    tone: "clear, instructive, helpful",
    sections: [
      "Prerequisites",
      "Setup",
      "Steps",
      "Common Issues",
      "Next Steps",
    ],
  },
  listicle: {
    structure: "numbered points with supporting details",
    tone: "concise, scannable, engaging",
    sections: ["Introduction", "Numbered Points", "Summary"],
  },
};

const keywordStrategies = {
  aggressive: {
    density: "3-4%",
    placement: "high frequency in titles, meta, first/last paragraphs",
    variations: "extensive use of semantic keywords",
  },
  balanced: {
    density: "1.5-2.5%",
    placement: "natural distribution with strategic positioning",
    variations: "moderate use of semantic keywords",
  },
  conservative: {
    density: "0.5-1.5%",
    placement: "natural flow prioritized over keyword placement",
    variations: "minimal semantic variations where natural",
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
  const styleGuide = styleGuides[style];
  const keywordGuide = keywordStrategies[keywordStrategy];

  // Extract competitor insights
  const {
    commonHeadings,
    commonTopics,
    contentGaps,
    keyInsights,
    uniqueAngles,
    recommendedWordCount,
    averageWordCount,
  } = selectedTopic.competitorInsights;

  return `As an expert content strategist, create a detailed outline for an article about "${
    selectedTopic.title
  }" that will outperform the current top-ranking content.

Content Parameters:
- Minimum word count: ${recommendedWordCount} (competitor average: ${averageWordCount})
- Content style: ${style} (${styleGuide.tone})
- Keyword strategy: ${keywordStrategy} (density: ${keywordGuide.density})
- Maximum heading depth: h${depth}
- Include introduction and conclusion: ${includeIntroConclusion}
- Include FAQ section: ${includeFAQ}

Competitor Analysis:
1. Common Topics Found:
${commonTopics.map((topic) => `   - ${topic}`).join("\n")}

2. Content Gaps to Address:
${contentGaps.map((gap) => `   - ${gap}`).join("\n")}

3. Unique Angles to Include:
${uniqueAngles.map((angle) => `   - ${angle}`).join("\n")}

4. Key Insights to Cover:
${keyInsights.map((insight) => `   - ${insight.topic}`).join("\n")}

5. Common Headings Structure:
${commonHeadings.map((heading) => `   - ${heading}`).join("\n")}

Primary Keywords: ${selectedTopic.targetKeywords.join(", ")}

Content Requirements:
1. Each section must:
   - Include SEO-optimized headings that outperform competitor titles
   - Cover topics more comprehensively than competitors
   - Address identified content gaps
   - Include unique insights not found in competitor content
   - Maintain proper keyword density and placement

2. Keyword Integration:
   - Primary keywords: ${keywordGuide.placement}
   - Use semantic variations from competitor content
   - Target content gaps: ${contentGaps.join(", ")}

3. Structure Guidelines:
   - Follow enhanced ${style} format: ${styleGuide.sections.join(" → ")}
   - Ensure logical flow and comprehensive coverage
   - Include detailed transition suggestions
   ${
     includeFAQ
       ? "- End with expert FAQ section addressing common search queries"
       : ""
   }

IMPORTANT: Your response must be a valid JSON object with this EXACT structure:

{
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
      "children": [
        {
          "id": "section-1-1",
          "title": "Detailed Analysis",
          "type": "h2",
          "content": "In-depth exploration of [subtopic]",
          "keyPoints": ["Point 1", "Point 2"],
          "recommendedWordCount": 500,
          "keywords": {
            "primary": ["subtopic keyword"],
            "secondary": ["related term"],
            "semantic": ["variant"]
          },
          "children": []
        }
      ]
    }
  ],
  "metadata": {
    "totalWordCount": 2500,
    "keywordDensity": {
      "main keyword": 2.5,
      "supporting term": 1.8
    },
    "readabilityScore": 75,
    "seoScore": 85
  },
  "seoGuidance": {
    "keywordPlacements": {
      "main keyword": {
        "recommended": 8,
        "sections": ["section-1", "section-2"]
      }
    },
    "contentGaps": [
      "Missing aspect 1",
      "Uncovered topic 2"
    ],
    "competitorInsights": {
      "averageSectionCount": 8,
      "commonHeadings": [
        "Common Title 1",
        "Common Title 2"
      ],
      "missingTopics": [
        "Gap 1",
        "Gap 2"
      ]
    }
  }
}

Quality Checks:
- Each section must be more detailed than competitor content
- Word count must exceed competitor averages
- Address ALL identified content gaps
- Include unique insights not found in competitor content
- Maintain proper keyword distribution
- Ensure all required fields are present and properly typed
- Validate that all IDs are unique
- Sections should add up to or exceed the recommended word count`;
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
