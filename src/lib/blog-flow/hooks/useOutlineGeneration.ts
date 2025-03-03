import { useState } from "react";
import {
  OutlineGenerationParams,
  OutlineGenerationResponse,
  OutlineSection,
  OutlineCustomization,
} from "../types/generation";

export function useOutlineGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outline, setOutline] = useState<
    OutlineGenerationResponse["outline"] | null
  >(null);

  const generateOutline = async (params: OutlineGenerationParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/blog-flow/outline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate outline");
      }

      if (data.success && data.outline) {
        setOutline(data.outline);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to generate outline. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const customizeOutline = async (customization: string) => {
    if (!outline) {
      setError("No outline to customize");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/blog-flow/outline", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outline,
          customization,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to customize outline");
      }

      if (data.success && data.outline) {
        setOutline(data.outline);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to customize outline. Please try again."
      );
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
        if (section.children) {
          return {
            ...section,
            children: updateSectionRecursive(section.children, id, updates),
          };
        }
        return section;
      });
    };

    setOutline({
      ...outline,
      sections: updateSectionRecursive(outline.sections, sectionId, updates),
    });
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
        if (section.children) {
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

    setOutline({
      ...outline,
      sections: addSectionRecursive(outline.sections, parentId, newSection),
    });
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
          if (section.children) {
            return {
              ...section,
              children: removeSectionRecursive(section.children, id),
            };
          }
          return section;
        });
    };

    setOutline({
      ...outline,
      sections: removeSectionRecursive(outline.sections, sectionId),
    });
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
        if (section.children) {
          const [newChildren, removed] = findAndRemoveSection(
            section.children,
            id
          );
          if (removed) {
            removedSection = removed;
            section.children = newChildren;
          }
        }
        return true;
      });
      return [newSections, removedSection];
    };

    const [sections, removedSection] = findAndRemoveSection(
      outline.sections,
      sectionId
    );
    if (removedSection) {
      sections.splice(newIndex, 0, removedSection);
      setOutline({
        ...outline,
        sections,
      });
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
  };
}
