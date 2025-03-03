import { SerpData, SerpResult } from "../types/generation";
import { fetchSerpData } from "./serpApi";

interface ContentAnalysis {
  mainHeadings: string[];
  subHeadings: string[];
  commonTopics: string[];
  wordCounts: {
    average: number;
    highest: number;
    recommended: number;
  };
  keyInsights: {
    topic: string;
    frequency: number;
  }[];
  uniqueAngles: string[];
  contentGaps: string[];
}

export async function analyzeSerpContent(
  searchTerm: string
): Promise<ContentAnalysis> {
  // Fetch SERP data for the search term
  const serpData = await fetchSerpData(searchTerm);

  if (!serpData) {
    throw new Error("Failed to fetch SERP data");
  }

  // Initialize content analysis
  const analysis: ContentAnalysis = {
    mainHeadings: [],
    subHeadings: [],
    commonTopics: [],
    wordCounts: {
      average: 0,
      highest: 0,
      recommended: 0,
    },
    keyInsights: [],
    uniqueAngles: [],
    contentGaps: [],
  };

  // Extract insights from organic results
  const results = serpData.organicResults || [];
  let totalWordCount = 0;

  results.forEach((result) => {
    // Estimate word count from snippet
    const wordCount = result.snippet.split(/\s+/).length * 10; // Rough estimation
    totalWordCount += wordCount;

    if (wordCount > analysis.wordCounts.highest) {
      analysis.wordCounts.highest = wordCount;
    }

    // Extract potential headings from title
    const heading = result.title
      .replace(/[-|]/g, " ")
      .replace(/[0-9]+\./g, "")
      .trim();

    if (!analysis.mainHeadings.includes(heading)) {
      analysis.mainHeadings.push(heading);
    }

    // Extract topics from snippet
    const topics = result.snippet
      .split(/[.!?]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 30)
      .map((s) => {
        const topic = s.replace(/^(how|what|why|when|where)\s+to\s+/i, "");
        return topic.charAt(0).toUpperCase() + topic.slice(1);
      });

    topics.forEach((topic) => {
      if (!analysis.commonTopics.includes(topic)) {
        analysis.commonTopics.push(topic);
      }
    });
  });

  // Calculate average and recommended word counts
  analysis.wordCounts.average = Math.round(totalWordCount / results.length);
  analysis.wordCounts.recommended = Math.round(
    analysis.wordCounts.highest * 1.5
  ); // 50% more than highest

  // Extract featured snippet insights if available
  if (serpData.featuredSnippets && serpData.featuredSnippets.length > 0) {
    serpData.featuredSnippets.forEach((snippet) => {
      const insights = snippet
        .split(/[.!?]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 20);

      insights.forEach((insight) => {
        analysis.keyInsights.push({
          topic: insight,
          frequency: 1,
        });
      });
    });
  }

  // Analyze related searches for unique angles and content gaps
  if (serpData.relatedSearches) {
    serpData.relatedSearches.forEach((search) => {
      if (
        !analysis.mainHeadings.some((h) =>
          search.toLowerCase().includes(h.toLowerCase())
        )
      ) {
        analysis.uniqueAngles.push(search);
      }
    });
  }

  // Identify content gaps by comparing topics across results
  const topicFrequency = new Map<string, number>();
  analysis.commonTopics.forEach((topic) => {
    const count = results.filter((r) =>
      r.snippet.toLowerCase().includes(topic.toLowerCase())
    ).length;
    topicFrequency.set(topic, count);
  });

  // Topics mentioned in less than 30% of results might be content gaps
  topicFrequency.forEach((frequency, topic) => {
    if (frequency <= 0.3 * results.length) {
      analysis.contentGaps.push(topic);
    }
  });

  return analysis;
}

export function generateCompetitorInsights(analysis: ContentAnalysis) {
  return {
    averageWordCount: analysis.wordCounts.average,
    recommendedWordCount: analysis.wordCounts.recommended,
    commonHeadings: analysis.mainHeadings.slice(0, 5),
    commonTopics: analysis.commonTopics.slice(0, 8),
    contentGaps: analysis.contentGaps.slice(0, 5),
    keyInsights: analysis.keyInsights.slice(0, 5),
    uniqueAngles: analysis.uniqueAngles.slice(0, 3),
  };
}
