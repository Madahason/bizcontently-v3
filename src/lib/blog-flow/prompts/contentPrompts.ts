import { BlogContentGenerationParams } from "../types/generation";

export const generateContentPrompt = ({
  outline,
  section,
  style = "conversational",
  tone = "professional",
  readabilityLevel = "intermediate",
}: BlogContentGenerationParams): string => {
  const targetSection = section
    ? outline.sections.find((s) => s.id === section)
    : null;

  const styleGuide = {
    formal:
      "Use formal language, avoid contractions, maintain professional distance",
    conversational:
      "Write in a friendly, engaging tone, use contractions, address reader directly",
    technical:
      "Include technical details, use industry terminology, provide in-depth explanations",
    storytelling:
      "Use narrative techniques, include examples, create engaging flow",
  }[style];

  const toneGuide = {
    professional: "Maintain expertise and authority while being accessible",
    friendly:
      "Create a warm, approachable atmosphere while maintaining credibility",
    authoritative: "Project expertise and deep knowledge of the subject matter",
    educational: "Focus on clear explanations and step-by-step guidance",
  }[tone];

  const readabilityGuide = {
    beginner: "Use simple language, short sentences, and clear explanations",
    intermediate:
      "Balance accessibility with some technical terms, vary sentence structure",
    advanced:
      "Use industry terminology, complex concepts, and detailed analysis",
  }[readabilityLevel];

  // Add default values for SEO guidance
  const defaultSeoGuidance = {
    keywordPlacements: {},
    contentGaps: [],
    competitorInsights: {
      averageSectionCount: 5,
      commonHeadings: [],
      missingTopics: [],
    },
  };

  const seoGuidance = outline.seoGuidance || defaultSeoGuidance;

  // Safely handle keywordPlacements
  const keywordGuidance = seoGuidance.keywordPlacements
    ? Object.entries(seoGuidance.keywordPlacements)
        .map(
          ([keyword, data]) =>
            `- "${keyword}": Use ${
              data.recommended
            } times, focus in sections: ${data.sections.join(", ")}`
        )
        .join("\n")
    : "- Use keywords naturally throughout the content";

  // Safely handle contentGaps
  const contentGapsGuidance = seoGuidance.contentGaps
    ? seoGuidance.contentGaps.map((gap) => `- Address: ${gap}`).join("\n")
    : "- Cover all aspects of the topic comprehensively";

  const competitorInsights =
    seoGuidance.competitorInsights || defaultSeoGuidance.competitorInsights;

  return `Generate high-quality blog content ${
    targetSection ? "for a specific section" : "following this outline"
  }.

${
  targetSection
    ? `SECTION TO WRITE:
Title: ${targetSection.title}
Type: ${targetSection.type}
Key Points: ${targetSection.keyPoints?.join(", ") || ""}
Word Count Target: ${targetSection.recommendedWordCount || "1000"}
`
    : "Follow the complete outline structure provided below"
}

CONTENT STRUCTURE:
${JSON.stringify(targetSection || outline.sections, null, 2)}

STYLE AND TONE:
Style: ${styleGuide}
Tone: ${toneGuide}
Readability: ${readabilityGuide}

SEO OPTIMIZATION:
Keyword Placement:
${keywordGuidance}

Content Gaps to Address:
${contentGapsGuidance}

Competitor Analysis:
- Average Section Count: ${competitorInsights.averageSectionCount || 5}
- Common Headings: ${
    (competitorInsights.commonHeadings || []).join(", ") || "N/A"
  }
- Missing Topics: ${
    (competitorInsights.missingTopics || []).join(", ") || "N/A"
  }

REQUIREMENTS:
1. Content Structure
- Follow the outline structure exactly
- Maintain proper heading hierarchy
- Include all key points specified
- Meet or exceed recommended word counts

2. SEO Optimization
- Implement keywords naturally at recommended frequency
- Address all identified content gaps
- Cover missing topics thoroughly
- Exceed competitor content depth

3. Content Quality
- Write engaging, original content
- Include relevant examples and data
- Maintain consistent style and tone
- Ensure smooth transitions between sections

4. Technical Requirements
- Format using proper markdown
- Include internal links where relevant
- Break up long paragraphs
- Use bullet points and lists for better readability

Generate the content in this JSON structure:
{
  "sections": [
    {
      "id": "string",
      "title": "string",
      "content": "string (markdown formatted)",
      "metadata": {
        "wordCount": number,
        "readabilityScore": number,
        "keywordDensity": { [keyword: string]: number }
      }
    }
  ],
  "metadata": {
    "totalWordCount": number,
    "averageReadabilityScore": number,
    "keywordDensityOverall": { [keyword: string]: number },
    "seoScore": number,
    "contentQualityMetrics": {
      "grammarScore": number,
      "coherenceScore": number,
      "engagementScore": number
    }
  },
  "seoAnalysis": {
    "keywordImplementation": {
      "primary": { [keyword: string]: { "occurrences": number, "density": number } },
      "secondary": [{ "keyword": string, "density": number, "occurrences": number }]
    },
    "contentGaps": string[],
    "missingTopics": string[],
    "improvementSuggestions": string[]
  }
}
`;
};

export const generateSectionCustomizationPrompt = (
  section: string,
  customization: string,
  seoGuidance: any
): string => {
  return `Customize this blog section while maintaining SEO optimization:

CURRENT CONTENT:
${section}

REQUESTED CHANGES:
${customization}

SEO REQUIREMENTS:
${JSON.stringify(seoGuidance, null, 2)}

Maintain keyword density and coverage of required topics while implementing the requested changes.
Return the modified content in the same JSON structure as the original.`;
};
