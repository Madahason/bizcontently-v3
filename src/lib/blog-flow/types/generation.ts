export interface TopicIdea {
  id: string;
  title: string;
  description: string;
  targetKeywords: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedWordCount: number;
  competitorInsights: {
    averageWordCount: number;
    commonSubtopics: string[];
    keywordGaps: string[];
    topResults?: SerpResult[];
    featuredSnippets?: string[];
    relatedSearches?: string[];
    commonHeadings: string[];
    commonTopics: string[];
    contentGaps: string[];
    keyInsights: Array<{
      topic: string;
      frequency: number;
    }>;
    uniqueAngles: string[];
    recommendedWordCount: number;
  };
  createdAt: Date;
}

export interface TopicGenerationParams {
  mainTopic: string;
  niche?: string;
  targetAudience?: string;
  contentLength?: "short" | "medium" | "long";
  difficulty?: "beginner" | "intermediate" | "advanced";
  includeSerpData?: boolean;
}

export interface TopicGenerationResponse {
  success: boolean;
  topics: TopicIdea[];
  error?: string;
}

export interface SerpResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface SerpData {
  organicResults: SerpResult[];
  featuredSnippets: string[];
  relatedSearches: string[];
  totalResults: number;
}

export interface AIStreamResponse {
  role: "assistant" | "user";
  content: string;
  done: boolean;
}

export interface OutlineSection {
  id: string;
  title: string;
  type: "h1" | "h2" | "h3" | "h4";
  content: string;
  keyPoints: string[];
  recommendedWordCount: number;
  keywords: {
    primary: string[];
    secondary: string[];
    semantic: string[];
  };
  children: OutlineSection[];
}

export interface OutlineMetadata {
  totalWordCount: number;
  keywordDensity: {
    [keyword: string]: number;
  };
  readabilityScore: number;
  seoScore: number;
}

export interface OutlineGenerationParams {
  selectedTopic: TopicIdea;
  style?: "academic" | "conversational" | "tutorial" | "listicle";
  depth?: 1 | 2 | 3 | 4;
  includeIntroConclusion?: boolean;
  includeFAQ?: boolean;
  keywordStrategy?: "aggressive" | "balanced" | "conservative";
}

export interface OutlineGenerationResponse {
  success: boolean;
  outline?: {
    sections: OutlineSection[];
    metadata: OutlineMetadata;
    seoGuidance: {
      keywordPlacements: {
        [keyword: string]: {
          recommended: number;
          sections: string[];
        };
      };
      contentGaps: string[];
      competitorInsights: {
        averageSectionCount: number;
        commonHeadings: string[];
        missingTopics: string[];
      };
    };
  };
  error?: string;
}

export interface OutlineCustomization {
  action: "add" | "remove" | "modify" | "reorder";
  sectionId?: string;
  parentId?: string;
  section?: Partial<OutlineSection>;
  newIndex?: number;
}

export interface BlogContentGenerationParams {
  outline: NonNullable<OutlineGenerationResponse["outline"]>;
  section?: string; // Optional: Generate content for a specific section only
  style?: "formal" | "conversational" | "technical" | "storytelling";
  tone?: "professional" | "friendly" | "authoritative" | "educational";
  readabilityLevel?: "beginner" | "intermediate" | "advanced";
  maxTokens?: number;
}

export interface BlogContentSection {
  id: string;
  content: string;
  wordCount: number;
  keywordDensity: {
    [keyword: string]: number;
  };
  readabilityScore: number;
}

export interface BlogContentGenerationResponse {
  success: boolean;
  content?: {
    sections: BlogContentSection[];
    metadata: {
      totalWordCount: number;
      averageReadabilityScore: number;
      keywordDensityOverall: {
        [keyword: string]: number;
      };
      seoScore: number;
      contentQualityMetrics: {
        comprehensiveness: number;
        engagement: number;
        clarity: number;
        expertise: number;
      };
    };
    seoAnalysis: {
      keywordImplementation: {
        [keyword: string]: {
          actual: number;
          recommended: number;
          placement: string[];
        };
      };
      contentGapsCovered: string[];
      missingTopics: string[];
      suggestions: string[];
    };
  };
  error?: string;
}
