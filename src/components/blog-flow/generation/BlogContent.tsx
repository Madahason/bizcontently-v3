import { BlogContentGenerationResponse } from "@/lib/blog-flow/types/generation";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface BlogContentProps {
  content: NonNullable<BlogContentGenerationResponse["content"]>;
}

export function BlogContent({ content }: BlogContentProps) {
  const [showMetadata, setShowMetadata] = useState(false);
  const [showSEOAnalysis, setShowSEOAnalysis] = useState(false);

  const totalWordCount = content.sections.reduce(
    (total, section) => total + section.wordCount,
    0
  );
  const averageReadability =
    content.sections.reduce(
      (total, section) => total + section.readabilityScore,
      0
    ) / content.sections.length;

  return (
    <div className="space-y-8">
      {/* Blog Content Sections */}
      <div className="prose prose-purple prose-lg max-w-none">
        {content.sections.map((section) => (
          <div key={section.id} className="mb-12">
            <div className="markdown-content prose-lg max-w-none">
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Word count: {section.wordCount.toLocaleString()} | Readability
              score: {section.readabilityScore}
            </div>
          </div>
        ))}

        {/* Word Count Summary */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Total Word Count: {totalWordCount.toLocaleString()} words
            </span>
            <span>
              Average Readability Score: {averageReadability.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Content Metadata */}
      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={() => setShowMetadata(!showMetadata)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-medium text-gray-900">Content Metrics</h3>
          <span className="ml-6 flex items-center">
            {showMetadata ? (
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
        </button>
        {showMetadata && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-800">
                Total Words
              </h4>
              <p className="mt-2 text-2xl font-semibold text-purple-900">
                {totalWordCount}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-800">
                Readability Score
              </h4>
              <p className="mt-2 text-2xl font-semibold text-purple-900">
                {averageReadability.toFixed(1)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-800">SEO Score</h4>
              <p className="mt-2 text-2xl font-semibold text-purple-900">
                {content.metadata.seoScore}%
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-800">
                Content Quality
              </h4>
              <div className="mt-2 space-y-1">
                {Object.entries(content.metadata.contentQualityMetrics).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="capitalize text-purple-700">{key}:</span>
                      <span className="font-medium text-purple-900">
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEO Analysis */}
      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={() => setShowSEOAnalysis(!showSEOAnalysis)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-medium text-gray-900">SEO Analysis</h3>
          <span className="ml-6 flex items-center">
            {showSEOAnalysis ? (
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
        </button>
        {showSEOAnalysis && (
          <div className="mt-4 space-y-6">
            {/* Keyword Implementation */}
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Keyword Implementation
              </h4>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Keyword
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actual
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recommended
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Placement
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(
                      content.seoAnalysis.keywordImplementation
                    ).map(([keyword, data]) => (
                      <tr key={keyword}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {keyword}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {data.actual}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {data.recommended}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {data.placement.join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Content Gaps */}
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Content Gaps Covered
              </h4>
              <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {content.seoAnalysis.contentGapsCovered.map((gap) => (
                  <li
                    key={gap}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {gap}
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Topics */}
            {content.seoAnalysis.missingTopics.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Missing Topics
                </h4>
                <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {content.seoAnalysis.missingTopics.map((topic) => (
                    <li
                      key={topic}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <svg
                        className="h-5 w-5 text-yellow-500 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {content.seoAnalysis.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Improvement Suggestions
                </h4>
                <ul className="mt-2 space-y-2">
                  {content.seoAnalysis.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="flex items-start text-sm text-gray-600"
                    >
                      <svg
                        className="h-5 w-5 text-blue-500 mr-2 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
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
