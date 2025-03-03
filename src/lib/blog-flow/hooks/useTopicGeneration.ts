import { useState } from "react";
import { TopicGenerationParams, TopicIdea } from "../types/generation";

export function useTopicGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<TopicIdea[]>([]);

  const generateTopics = async (params: TopicGenerationParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/blog-flow/topic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate topics");
      }

      if (data.success && data.topics) {
        const topicsWithIds = data.topics.map(
          (topic: Omit<TopicIdea, "id" | "createdAt">) => ({
            ...topic,
            id: crypto.randomUUID(),
            createdAt: new Date(),
          })
        );
        setTopics(topicsWithIds);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to generate topics. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    topics,
    isLoading,
    error,
    generateTopics,
  };
}
