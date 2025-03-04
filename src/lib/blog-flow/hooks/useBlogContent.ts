import { useState, useEffect } from "react";
import {
  BlogContentGenerationParams,
  BlogContentGenerationResponse,
  OutlineGenerationResponse,
} from "../types/generation";

const BLOG_CONTENT_STORAGE_KEY = "blog_content_state";

export function useBlogContent() {
  const [content, setContent] = useState<BlogContentGenerationResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved content on mount
  useEffect(() => {
    try {
      const savedContent = localStorage.getItem(BLOG_CONTENT_STORAGE_KEY);
      if (savedContent) {
        const parsedContent = JSON.parse(savedContent);
        // Ensure the saved content has the correct structure
        if (parsedContent && parsedContent.sections) {
          setContent(parsedContent);
        }
      }
    } catch (err) {
      console.error("Error loading saved content:", err);
    }
  }, []);

  // Save content whenever it changes
  useEffect(() => {
    if (content) {
      try {
        localStorage.setItem(BLOG_CONTENT_STORAGE_KEY, JSON.stringify(content));
      } catch (err) {
        console.error("Error saving content:", err);
      }
    }
  }, [content]);

  const generateContent = async (
    outline: OutlineGenerationResponse,
    params?: Partial<Omit<BlogContentGenerationParams, "outline">>
  ) => {
    try {
      setIsLoading(true);
      setError(null);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate blog content");
      }

      const data = await response.json();
      setContent(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateContent = (newContent: BlogContentGenerationResponse) => {
    setContent(newContent);
  };

  const clearSavedContent = () => {
    try {
      localStorage.removeItem(BLOG_CONTENT_STORAGE_KEY);
      setContent(null);
    } catch (err) {
      console.error("Error clearing saved content:", err);
    }
  };

  return {
    content,
    isLoading,
    error,
    generateContent,
    updateContent,
    clearSavedContent,
  };
}
