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

  const seoGuidance = outline.seoGuidance;
  const keywordGuidance = Object.entries(seoGuidance.keywordPlacements)
    .map(
      ([keyword, data]) =>
        `- "${keyword}": Use ${
          data.recommended
        } times, focus in sections: ${data.sections.join(", ")}`
    )
    .join("\n");

  const contentGapsGuidance = seoGuidance.contentGaps
    .map((gap) => `- Address: ${gap}`)
    .join("\n");

  const competitorInsights = seoGuidance.competitorInsights;

  return `Generate high-quality blog content ${
    targetSection ? "for a specific section" : "following this outline"
  }.

${
  targetSection
    ? `SECTION TO WRITE:
Title: ${targetSection.title}
Type: ${targetSection.type}
Key Points: ${targetSection.keyPoints.join(", ")}
Word Count Target: ${targetSection.recommendedWordCount}
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
- Average Section Count: ${competitorInsights.averageSectionCount}
- Common Headings: ${competitorInsights.commonHeadings.join(", ")}
- Missing Topics: ${competitorInsights.missingTopics.join(", ")}

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
      "content": "string (markdown formatted)",
      "wordCount": number,
      "keywordDensity": {
        "keyword": number
      },
      "readabilityScore": number
    }
  ],
  "metadata": {
    "totalWordCount": number,
    "averageReadabilityScore": number,
    "keywordDensityOverall": {
      "keyword": number
    },
    "seoScore": number,
    "contentQualityMetrics": {
      "comprehensiveness": number,
      "engagement": number,
      "clarity": number,
      "expertise": number
    }
  },
  "seoAnalysis": {
    "keywordImplementation": {
      "keyword": {
        "actual": number,
        "recommended": number,
        "placement": ["string"]
      }
    },
    "contentGapsCovered": ["string"],
    "missingTopics": ["string"],
    "suggestions": ["string"]
  }
}`;
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
