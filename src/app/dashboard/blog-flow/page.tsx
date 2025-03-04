"use client";

import { useState, useEffect } from "react";
import { TopicForm } from "@/components/blog-flow/generation/TopicForm";
import { TopicList } from "@/components/blog-flow/generation/TopicList";
import { OutlineForm } from "@/components/blog-flow/generation/OutlineForm";
import { OutlineEditor } from "@/components/blog-flow/generation/OutlineEditor";
import BlogContent from "@/components/blog-flow/generation/BlogContent";
import { useTopicGeneration } from "@/lib/blog-flow/hooks/useTopicGeneration";
import { useOutlineGeneration } from "@/lib/blog-flow/hooks/useOutlineGeneration";
import { useBlogContent } from "@/lib/blog-flow/hooks/useBlogContent";
import {
  TopicGenerationParams,
  TopicIdea,
  OutlineGenerationParams,
} from "@/lib/blog-flow/types/generation";

const BLOG_FLOW_STATE_KEY = "blog_flow_state";

type FlowStep = "topic" | "outline" | "content";

interface BlogFlowState {
  currentStep: FlowStep;
  selectedTopic: TopicIdea | null;
}

export default function BlogFlowPage() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("topic");
  const [selectedTopic, setSelectedTopic] = useState<TopicIdea | null>(null);

  const {
    topics,
    isLoading: isTopicLoading,
    error: topicError,
    generateTopics,
  } = useTopicGeneration();

  const {
    outline,
    isLoading: isOutlineLoading,
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
    isLoading: isContentLoading,
    error: contentError,
    generateContent,
  } = useBlogContent();

  // Load saved state on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(BLOG_FLOW_STATE_KEY);
      if (savedState) {
        const { currentStep: savedStep, selectedTopic: savedTopic } =
          JSON.parse(savedState);
        if (savedStep) setCurrentStep(savedStep);
        if (savedTopic) setSelectedTopic(savedTopic);
      }
    } catch (err) {
      console.error("Error loading blog flow state:", err);
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    try {
      const state: BlogFlowState = {
        currentStep,
        selectedTopic,
      };
      localStorage.setItem(BLOG_FLOW_STATE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Error saving blog flow state:", err);
    }
  }, [currentStep, selectedTopic]);

  const handleTopicSubmit = async (params: TopicGenerationParams) => {
    await generateTopics(params);
  };

  const handleTopicSelect = (topic: TopicIdea) => {
    setSelectedTopic(topic);
    setCurrentStep("outline");
  };

  const handleOutlineGenerate = async (params: OutlineGenerationParams) => {
    await generateOutline(params);
    setCurrentStep("content");
  };

  const handleGenerateContent = async () => {
    if (!outline) return;
    try {
      const generatedContent = await generateContent(outline);
      if (generatedContent) {
        setCurrentStep("content");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      // Stay on outline step if there's an error
      setCurrentStep("outline");
    }
  };

  const handleElaborateSection = async (sectionId: string): Promise<string> => {
    if (!content) return "";

    const section = content.sections.find((s) => s.id === sectionId);
    if (!section) return "";

    try {
      const response = await fetch("/api/blog-flow/elaborate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Elaborate and expand on this section while maintaining the same style and tone. Add more details, examples, and depth to the content:\n\n${section.content}`,
          originalContent: section.content,
          targetWordCount: Math.round(section.metadata.wordCount * 1.5),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to elaborate section");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let elaboratedContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          elaboratedContent += decoder.decode(value);
        }
      }

      return elaboratedContent;
    } catch (error) {
      console.error("Error elaborating section:", error);
      return section.content;
    }
  };

  const clearAllState = () => {
    try {
      localStorage.removeItem(BLOG_FLOW_STATE_KEY);
      setCurrentStep("topic");
      setSelectedTopic(null);
    } catch (err) {
      console.error("Error clearing blog flow state:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Progress Steps */}
        <nav className="flex justify-center my-8">
          <ol className="flex items-center space-x-4">
            {["topic", "outline", "content"].map((step) => (
              <li key={step}>
                <div
                  className={`flex items-center ${
                    currentStep === step ? "text-purple-600" : "text-gray-400"
                  }`}
                >
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentStep === step ? "bg-purple-100" : "bg-gray-100"
                    }`}
                  >
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        {/* Topic Generation */}
        {currentStep === "topic" && (
          <div className="space-y-8">
            <TopicForm
              onSubmit={handleTopicSubmit}
              isLoading={isTopicLoading}
            />
            {topicError && <div className="text-red-600">{topicError}</div>}
            <TopicList
              topics={topics}
              onSelectTopic={handleTopicSelect}
              selectedTopicId={selectedTopic?.id}
            />
          </div>
        )}

        {/* Outline Generation */}
        {currentStep === "outline" && selectedTopic && (
          <div className="space-y-8">
            <OutlineForm
              selectedTopic={selectedTopic}
              onSubmit={handleOutlineGenerate}
              isLoading={isOutlineLoading}
            />
            {outlineError && <div className="text-red-600">{outlineError}</div>}
            {outline && (
              <OutlineEditor
                outline={outline}
                onCustomize={customizeOutline}
                onUpdateSection={updateSection}
                onAddSection={addSection}
                onRemoveSection={removeSection}
                onReorderSection={reorderSections}
                onGenerateContent={handleGenerateContent}
                isLoading={isContentLoading}
              />
            )}
          </div>
        )}

        {/* Content Display */}
        {currentStep === "content" && content && (
          <div>
            {contentError && <div className="text-red-600">{contentError}</div>}
            <BlogContent
              content={content}
              targetWordCount={outline?.metadata.estimatedWordCount}
              onElaborate={handleElaborateSection}
            />
          </div>
        )}
      </div>
    </div>
  );
}
