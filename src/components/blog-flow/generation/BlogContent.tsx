import {
  BlogContentGenerationResponse,
  BlogContentSection,
  KeywordImplementation,
} from "@/lib/blog-flow/types/generation";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  findRelevantLinks,
  insertLinks,
} from "@/lib/blog-flow/utils/textAnalysis";

interface KeywordData {
  occurrences: number;
  density: number;
}

interface BlogContentProps {
  content: BlogContentGenerationResponse;
  targetWordCount?: number;
  onElaborate?: (sectionId: string) => Promise<string>;
}

export default function BlogContent({
  content,
  targetWordCount,
  onElaborate,
}: BlogContentProps) {
  const [showMetrics, setShowMetrics] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  const [elaboratingSections, setElaboratingSections] = useState<string[]>([]);
  const [sections, setSections] = useState<BlogContentSection[]>(
    content.sections
  );

  const totalWordCount = sections.reduce(
    (total, section) => total + section.metadata.wordCount,
    0
  );

  const handleElaborate = async (sectionId: string) => {
    if (!onElaborate || elaboratingSections.includes(sectionId)) return;

    try {
      setElaboratingSections((prev) => [...prev, sectionId]);

      // Find the section to elaborate
      const sectionIndex = sections.findIndex((s) => s.id === sectionId);
      if (sectionIndex === -1) return;

      // Get elaborated content
      const elaboratedContent = await onElaborate(sectionId);

      // Update the section with elaborated content
      const updatedSections = [...sections];
      updatedSections[sectionIndex] = {
        ...sections[sectionIndex],
        content: elaboratedContent,
        metadata: {
          ...sections[sectionIndex].metadata,
          wordCount: elaboratedContent.split(/\s+/).length,
        },
      };

      setSections(updatedSections);
    } catch (error) {
      console.error("Error elaborating section:", error);
    } finally {
      setElaboratingSections((prev) => prev.filter((id) => id !== sectionId));
    }
  };

  const getWordCountColor = (count: number) => {
    if (!targetWordCount) return "text-gray-600";
    const percentage = (count / targetWordCount) * 100;
    if (percentage >= 90 && percentage <= 110) return "text-green-600";
    if (percentage >= 75 && percentage <= 125) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressBarColor = (count: number) => {
    if (!targetWordCount) return "bg-gray-600";
    const percentage = (count / targetWordCount) * 100;
    if (percentage >= 90 && percentage <= 110) return "bg-green-600";
    if (percentage >= 75 && percentage <= 125) return "bg-yellow-600";
    return "bg-red-600";
  };

  const getWordCountStatus = () => {
    if (!targetWordCount) return "";
    const difference = totalWordCount - targetWordCount;
    if (Math.abs(difference) <= targetWordCount * 0.1) return "on target";
    return difference > 0
      ? `${difference.toLocaleString()} words over target`
      : `${Math.abs(difference).toLocaleString()} words under target`;
  };

  return (
    <div className="space-y-8">
      {/* Blog Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {sections[0]?.title}
      </h1>

      {/* Blog Content */}
      <article className="prose prose-lg max-w-none markdown-content">
        {sections.map((section, index) => (
          <div key={section.id} className="mb-12">
            {/* Section Content */}
            <ReactMarkdown>{section.content}</ReactMarkdown>

            {/* Elaborate Button */}
            {onElaborate && (
              <div className="mt-4">
                <button
                  onClick={() => handleElaborate(section.id)}
                  disabled={elaboratingSections.includes(section.id)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {elaboratingSections.includes(section.id) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                      Elaborating...
                    </>
                  ) : (
                    "Elaborate This Section"
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </article>

      {/* Word Count and Metrics */}
      <div className="border-t border-gray-200 pt-6">
        <div className="space-y-4">
          {/* Word Count Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-900">Word Count</h3>
              <span
                className={`text-sm font-medium ${getWordCountColor(
                  totalWordCount
                )}`}
              >
                {totalWordCount.toLocaleString()} /{" "}
                {targetWordCount?.toLocaleString() || "N/A"} words
              </span>
            </div>
            {targetWordCount && (
              <>
                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full transition-all duration-300 ${getProgressBarColor(
                      totalWordCount
                    )}`}
                    style={{
                      width: `${Math.min(
                        (totalWordCount / targetWordCount) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {getWordCountStatus()}
                </p>
              </>
            )}
          </div>

          {/* Content Metrics */}
          <div>
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="flex items-center text-sm font-medium text-gray-900 hover:text-gray-700"
            >
              <svg
                className={`mr-2 h-5 w-5 transform transition-transform ${
                  showMetrics ? "rotate-90" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Content Metrics
            </button>
            {showMetrics && (
              <div className="mt-2 pl-7 space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Quality Scores</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Grammar</p>
                      <p className="text-sm font-medium">
                        {content.metadata.contentQualityMetrics.grammarScore}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Coherence</p>
                      <p className="text-sm font-medium">
                        {content.metadata.contentQualityMetrics.coherenceScore}
                        /10
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Engagement</p>
                      <p className="text-sm font-medium">
                        {content.metadata.contentQualityMetrics.engagementScore}
                        /10
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEO Analysis */}
          <div>
            <button
              onClick={() => setShowSEO(!showSEO)}
              className="flex items-center text-sm font-medium text-gray-900 hover:text-gray-700"
            >
              <svg
                className={`mr-2 h-5 w-5 transform transition-transform ${
                  showSEO ? "rotate-90" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              SEO Analysis
            </button>
            {showSEO && (
              <div className="mt-2 pl-7 space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">
                    Overall SEO Score
                  </h4>
                  <p className="text-sm">{content.metadata.seoScore}/100</p>
                </div>

                {/* Keyword Implementation */}
                <div>
                  <h4 className="text-sm font-medium mb-1">
                    Keyword Implementation
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(
                      content.seoAnalysis.keywordImplementation.primary
                    ).map(([keyword, data]) => (
                      <div key={keyword} className="flex justify-between">
                        <span className="text-sm text-gray-500">{keyword}</span>
                        <span className="text-sm">
                          {data.occurrences} times ({data.density.toFixed(2)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Gaps */}
                {content.seoAnalysis.contentGaps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Content Gaps</h4>
                    <ul className="list-disc list-inside text-sm text-gray-500">
                      {content.seoAnalysis.contentGaps.map((gap, index) => (
                        <li key={index}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing Topics */}
                {content.seoAnalysis.missingTopics.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Missing Topics</h4>
                    <ul className="list-disc list-inside text-sm text-gray-500">
                      {content.seoAnalysis.missingTopics.map((topic, index) => (
                        <li key={index}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvement Suggestions */}
                {content.seoAnalysis.improvementSuggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      Improvement Suggestions
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-500">
                      {content.seoAnalysis.improvementSuggestions.map(
                        (suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this CSS to your global styles or component
const styles = `
  .markdown-content {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.8;
    color: #374151;
  }

  .markdown-content h1 {
    font-size: 2.25rem;
    font-weight: 700;
    margin-top: 2.5rem;
    margin-bottom: 1.5rem;
    color: #111827;
  }

  .markdown-content h2 {
    font-size: 1.875rem;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 1.25rem;
    color: #1F2937;
  }

  .markdown-content h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1.75rem;
    margin-bottom: 1rem;
    color: #374151;
  }

  .markdown-content p {
    margin-bottom: 1.25rem;
  }

  .markdown-content ul, .markdown-content ol {
    margin-top: 1rem;
    margin-bottom: 1rem;
    padding-left: 2rem;
  }

  .markdown-content li {
    margin-bottom: 0.5rem;
  }

  .markdown-content blockquote {
    border-left: 4px solid #E5E7EB;
    padding-left: 1rem;
    margin: 1.5rem 0;
    color: #4B5563;
    font-style: italic;
  }

  .markdown-content code {
    background-color: #F3F4F6;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    color: #DC2626;
  }

  .markdown-content pre {
    background-color: #F3F4F6;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1.5rem 0;
  }

  .markdown-content img {
    border-radius: 0.5rem;
    margin: 1.5rem 0;
  }

  .markdown-content a {
    color: #6D28D9;
    text-decoration: underline;
  }

  .markdown-content a:hover {
    color: #5B21B6;
  }
`;
