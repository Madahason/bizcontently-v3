import { useState, useEffect } from "react";
import {
  OutlineGenerationParams,
  OutlineGenerationResponse,
  OutlineSection,
} from "../types/generation";

const OUTLINE_STORAGE_KEY = "blog_outline_state";

export function useOutlineGeneration() {
  const [outline, setOutline] = useState<OutlineGenerationResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved outline on mount
  useEffect(() => {
    try {
      const savedOutline = localStorage.getItem(OUTLINE_STORAGE_KEY);
      if (savedOutline) {
        const parsedOutline = JSON.parse(savedOutline);
        // Ensure the saved outline has the correct structure
        if (parsedOutline && parsedOutline.sections) {
          setOutline(parsedOutline);
        }
      }
    } catch (err) {
      console.error("Error loading saved outline:", err);
    }
  }, []);

  // Save outline whenever it changes
  useEffect(() => {
    if (outline) {
      try {
        localStorage.setItem(OUTLINE_STORAGE_KEY, JSON.stringify(outline));
      } catch (err) {
        console.error("Error saving outline:", err);
      }
    }
  }, [outline]);

  const generateOutline = async (params: OutlineGenerationParams) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/blog-flow/outline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate outline");
      }

      const data = await response.json();
      setOutline(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const customizeOutline = async (customization: string) => {
    if (!outline) {
      throw new Error("No outline to customize");
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/blog-flow/outline", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outline: JSON.stringify(outline),
          customization,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to customize outline");
      }

      const data = await response.json();
      setOutline(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSection = (
    sectionId: string,
    updates: Partial<OutlineSection>
  ) => {
    if (!outline) return;

    const updateSectionRecursive = (
      sections: OutlineSection[],
      id: string,
      updates: Partial<OutlineSection>
    ): OutlineSection[] => {
      return sections.map((section) => {
        if (section.id === id) {
          return { ...section, ...updates };
        }
        if (section.children && section.children.length > 0) {
          return {
            ...section,
            children: updateSectionRecursive(section.children, id, updates),
          };
        }
        return section;
      });
    };

    const updatedOutline = {
      ...outline,
      sections: updateSectionRecursive(outline.sections, sectionId, updates),
    };

    setOutline(updatedOutline);
  };

  const addSection = (parentId: string | null, newSection: OutlineSection) => {
    if (!outline) return;

    const addSectionRecursive = (
      sections: OutlineSection[],
      parentId: string | null,
      newSection: OutlineSection
    ): OutlineSection[] => {
      if (!parentId) {
        return [...sections, newSection];
      }

      return sections.map((section) => {
        if (section.id === parentId) {
          return {
            ...section,
            children: [...(section.children || []), newSection],
          };
        }
        if (section.children && section.children.length > 0) {
          return {
            ...section,
            children: addSectionRecursive(
              section.children,
              parentId,
              newSection
            ),
          };
        }
        return section;
      });
    };

    const updatedOutline = {
      ...outline,
      sections: addSectionRecursive(outline.sections, parentId, newSection),
    };

    setOutline(updatedOutline);
  };

  const removeSection = (sectionId: string) => {
    if (!outline) return;

    const removeSectionRecursive = (
      sections: OutlineSection[],
      id: string
    ): OutlineSection[] => {
      return sections
        .filter((section) => section.id !== id)
        .map((section) => {
          if (section.children && section.children.length > 0) {
            return {
              ...section,
              children: removeSectionRecursive(section.children, id),
            };
          }
          return section;
        });
    };

    const updatedOutline = {
      ...outline,
      sections: removeSectionRecursive(outline.sections, sectionId),
    };

    setOutline(updatedOutline);
  };

  const reorderSections = (sectionId: string, newIndex: number) => {
    if (!outline) return;

    const findAndRemoveSection = (
      sections: OutlineSection[],
      id: string
    ): [OutlineSection[], OutlineSection | null] => {
      let removedSection: OutlineSection | null = null;
      const newSections = sections.filter((section) => {
        if (section.id === id) {
          removedSection = section;
          return false;
        }
        return true;
      });
      return [newSections, removedSection];
    };

    const [remainingSections, sectionToMove] = findAndRemoveSection(
      outline.sections,
      sectionId
    );

    if (sectionToMove) {
      const updatedSections = [
        ...remainingSections.slice(0, newIndex),
        sectionToMove,
        ...remainingSections.slice(newIndex),
      ];

      setOutline({
        ...outline,
        sections: updatedSections,
      });
    }
  };

  const clearSavedOutline = () => {
    try {
      localStorage.removeItem(OUTLINE_STORAGE_KEY);
      setOutline(null);
    } catch (err) {
      console.error("Error clearing saved outline:", err);
    }
  };

  return {
    outline,
    isLoading,
    error,
    generateOutline,
    customizeOutline,
    updateSection,
    addSection,
    removeSection,
    reorderSections,
    clearSavedOutline,
  };
}
