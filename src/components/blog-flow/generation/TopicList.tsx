import { TopicIdea } from "@/lib/blog-flow/types/generation";

interface TopicListProps {
  topics: TopicIdea[];
  onSelectTopic: (topic: TopicIdea) => void;
  selectedTopicId?: string;
}

export function TopicList({
  topics,
  onSelectTopic,
  selectedTopicId,
}: TopicListProps) {
  if (topics.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Generated Topic Ideas
      </h2>
      <div className="space-y-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className={`p-4 rounded-lg border ${
              selectedTopicId === topic.id
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-purple-300"
            } cursor-pointer transition-colors duration-200`}
            onClick={() => onSelectTopic(topic)}
          >
            <div className="space-y-3">
              <h3 className="text-base font-medium text-gray-900">
                {topic.title}
              </h3>
              <p className="text-sm text-gray-600">{topic.description}</p>

              <div className="flex flex-wrap gap-2">
                {topic.targetKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Difficulty:</span>{" "}
                  <span className="capitalize">{topic.difficulty}</span>
                </div>
                <div>
                  <span className="font-medium">Word Count:</span>{" "}
                  {topic.estimatedWordCount.toLocaleString()}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Competitor Insights
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Avg. Word Count:</span>{" "}
                    {topic.competitorInsights.averageWordCount.toLocaleString()}
                  </div>

                  {topic.competitorInsights.topResults && (
                    <div>
                      <span className="font-medium">Top Results:</span>
                      <ul className="mt-1 space-y-2">
                        {topic.competitorInsights.topResults.map((result) => (
                          <li
                            key={result.link}
                            className="text-sm bg-gray-50 rounded p-2"
                          >
                            <a
                              href={result.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-purple-600 hover:text-purple-500"
                            >
                              {result.title}
                            </a>
                            <p className="mt-1 text-gray-500">
                              {result.snippet}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.competitorInsights.featuredSnippets &&
                    topic.competitorInsights.featuredSnippets.length > 0 && (
                      <div>
                        <span className="font-medium">Featured Snippets:</span>
                        <ul className="mt-1 space-y-2">
                          {topic.competitorInsights.featuredSnippets.map(
                            (snippet, index) => (
                              <li
                                key={index}
                                className="text-sm bg-yellow-50 rounded p-2"
                              >
                                {snippet}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  <div>
                    <span className="font-medium">Common Subtopics:</span>
                    <ul className="list-disc list-inside ml-2">
                      {topic.competitorInsights.commonSubtopics.map(
                        (subtopic) => (
                          <li key={subtopic}>{subtopic}</li>
                        )
                      )}
                    </ul>
                  </div>

                  {topic.competitorInsights.relatedSearches && (
                    <div>
                      <span className="font-medium">Related Searches:</span>
                      <ul className="mt-1 flex flex-wrap gap-2">
                        {topic.competitorInsights.relatedSearches.map(
                          (search, index) => (
                            <li
                              key={index}
                              className="text-xs bg-gray-100 rounded-full px-3 py-1"
                            >
                              {search}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  <div>
                    <span className="font-medium">Content Gaps:</span>
                    <ul className="list-disc list-inside ml-2">
                      {topic.competitorInsights.keywordGaps.map((gap) => (
                        <li key={gap}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
