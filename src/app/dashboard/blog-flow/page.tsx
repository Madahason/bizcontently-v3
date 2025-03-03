"use client";

import { useState } from "react";
import { TopicForm } from "@/components/blog-flow/generation/TopicForm";
import { TopicList } from "@/components/blog-flow/generation/TopicList";
import { OutlineForm } from "@/components/blog-flow/generation/OutlineForm";
import { OutlineEditor } from "@/components/blog-flow/generation/OutlineEditor";
import { BlogContent } from "@/components/blog-flow/generation/BlogContent";
import { useTopicGeneration } from "@/lib/blog-flow/hooks/useTopicGeneration";
import { useOutlineGeneration } from "@/lib/blog-flow/hooks/useOutlineGeneration";
import { useBlogContent } from "@/lib/blog-flow/hooks/useBlogContent";
import { TopicIdea } from "@/lib/blog-flow/types/generation";

export default function BlogFlowPage() {
  const {
    topics,
    isLoading: isLoadingTopics,
    error: topicError,
    generateTopics,
  } = useTopicGeneration();

  const {
    outline,
    isLoading: isLoadingOutline,
    error: outlineError,
    generateOutline,
    customizeOutline,
    updateSection,
    addSection,
    removeSection,
    reorderSections,
  } = useOutlineGeneration();

  const {
    content,
    isLoading: isLoadingContent,
    error: contentError,
    generateContent,
  } = useBlogContent();

  const [selectedTopic, setSelectedTopic] = useState<TopicIdea | null>(null);
  const [step, setStep] = useState<"topic" | "outline" | "content">("topic");

  const handleTopicSelect = (topic: TopicIdea) => {
    setSelectedTopic(topic);
    setStep("outline");
  };

  const handleOutlineGenerate = async (params: any) => {
    if (!selectedTopic) return;
    await generateOutline({ selectedTopic, ...params });
  };

  const handleGenerateContent = async () => {
    if (!outline) return;
    setStep("content");
    try {
      await generateContent(outline, {
        style: "conversational",
        tone: "professional",
        readabilityLevel: "intermediate",
      });
    } catch (error) {
      // Error is handled by the hook
      setStep("outline");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Blog Flow</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create engaging blog content with AI-powered assistance
        </p>
      </div>

      <div className="mt-6">
        {step === "topic" && (
          <>
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="max-w-xl">
                  <TopicForm
                    onSubmit={generateTopics}
                    isLoading={isLoadingTopics}
                  />
                </div>

                {topicError && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{topicError}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(topics.length > 0 || isLoadingTopics) && (
              <div className="mt-6 bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  {isLoadingTopics ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <TopicList
                      topics={topics}
                      onSelectTopic={handleTopicSelect}
                      selectedTopicId={selectedTopic?.id}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {step === "outline" && selectedTopic && (
          <div className="space-y-6">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Selected Topic: {selectedTopic.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {selectedTopic.description}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTopic(null);
                        setStep("topic");
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Change Topic
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {!outline ? (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <OutlineForm
                    selectedTopic={selectedTopic}
                    onSubmit={handleOutlineGenerate}
                    isLoading={isLoadingOutline}
                  />

                  {outlineError && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{outlineError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <OutlineEditor
                outline={outline}
                onCustomize={customizeOutline}
                onUpdateSection={updateSection}
                onAddSection={addSection}
                onRemoveSection={removeSection}
                onReorderSection={reorderSections}
                onGenerateContent={handleGenerateContent}
                isLoading={isLoadingOutline || isLoadingContent}
              />
            )}
          </div>
        )}

        {step === "content" && outline && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="sm:flex sm:items-start sm:justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {isLoadingContent
                    ? "Generating Blog Content..."
                    : "Blog Content"}
                </h3>
                <div className="mt-4 sm:mt-0">
                  <button
                    type="button"
                    onClick={() => setStep("outline")}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Back to Outline
                  </button>
                </div>
              </div>

              <div className="mt-4">
                {isLoadingContent ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : contentError ? (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{contentError}</p>
                      </div>
                    </div>
                  </div>
                ) : content ? (
                  <BlogContent content={content} />
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
