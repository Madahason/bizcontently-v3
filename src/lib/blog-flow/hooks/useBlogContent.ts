import { useState } from "react";
import {
  BlogContentGenerationParams,
  BlogContentGenerationResponse,
  OutlineGenerationResponse,
} from "../types/generation";

export function useBlogContent() {
  const [content, setContent] =
    useState<BlogContentGenerationResponse["content"]>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const generateContent = async (
    outline: NonNullable<OutlineGenerationResponse["outline"]>,
    params?: Partial<Omit<BlogContentGenerationParams, "outline">>
  ) => {
    try {
      setIsLoading(true);
      setError(undefined);

      const response = await fetch("/api/blog-flow/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outline,
          ...params,
        }),
      });

      const data: BlogContentGenerationResponse = await response.json();

      if (!data.success || !data.content) {
        throw new Error(data.error || "Failed to generate blog content");
      }

      setContent(data.content);
      return data.content;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    content,
    isLoading,
    error,
    generateContent,
  };
}
