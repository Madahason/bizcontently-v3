export interface TopicIdea {
  id: string;
  title: string;
  description: string;
  targetKeywords: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedWordCount: number;
  competitorInsights: {
    recommendedWordCount: number;
    keywordDensity: { [keyword: string]: number };
    averageHeadings: number;
    averageWordCount: number;
    commonSubtopics: string[];
    keywordGaps: string[];
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
  metadata: {
    wordCount: number;
    readabilityScore: number;
  };
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
  title: string;
  introduction: string;
  sections: OutlineSection[];
  conclusion: string;
  metadata: {
    estimatedWordCount: number;
    targetKeywords: string[];
  };
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
}

export interface OutlineCustomization {
  action: "add" | "remove" | "modify" | "reorder";
  sectionId?: string;
  parentId?: string;
  section?: Partial<OutlineSection>;
  newIndex?: number;
}

export interface BlogContentGenerationParams {
  outline: OutlineGenerationResponse;
  section?: string; // Optional: Generate content for a specific section only
  style?: "formal" | "conversational" | "technical" | "storytelling";
  tone?: "professional" | "friendly" | "authoritative" | "educational";
  readabilityLevel?: "beginner" | "intermediate" | "advanced";
  maxTokens?: number;
}

export interface BlogContentSection {
  id: string;
  title: string;
  content: string;
  metadata: {
    wordCount: number;
    readabilityScore: number;
    keywordDensity: { [keyword: string]: number };
  };
}

export interface BlogContentMetadata {
  totalWordCount: number;
  averageReadabilityScore: number;
  keywordDensityOverall: { [keyword: string]: number };
  seoScore: number;
  contentQualityMetrics: {
    grammarScore: number;
    coherenceScore: number;
    engagementScore: number;
  };
}

export interface KeywordImplementation {
  occurrences: number;
  density: number;
}

export interface SeoAnalysis {
  keywordImplementation: {
    primary: {
      [keyword: string]: KeywordImplementation;
    };
    secondary: Array<{
      keyword: string;
      density: number;
      occurrences: number;
    }>;
  };
  contentGaps: string[];
  missingTopics: string[];
  improvementSuggestions: string[];
}

export interface BlogContentGenerationResponse {
  sections: BlogContentSection[];
  metadata: BlogContentMetadata;
  seoAnalysis: SeoAnalysis;
}
