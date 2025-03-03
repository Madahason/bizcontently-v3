import { useState } from "react";
import {
  OutlineSection,
  OutlineGenerationResponse,
} from "@/lib/blog-flow/types/generation";

interface OutlineEditorProps {
  outline: NonNullable<OutlineGenerationResponse["outline"]>;
  onCustomize: (customization: string) => void;
  onUpdateSection: (
    sectionId: string,
    updates: Partial<OutlineSection>
  ) => void;
  onAddSection: (parentId: string | null, section: OutlineSection) => void;
  onRemoveSection: (sectionId: string) => void;
  onReorderSection: (sectionId: string, newIndex: number) => void;
  onGenerateContent: () => void;
  isLoading: boolean;
}

export function OutlineEditor({
  outline,
  onCustomize,
  onUpdateSection,
  onAddSection,
  onRemoveSection,
  onReorderSection,
  onGenerateContent,
  isLoading,
}: OutlineEditorProps) {
  const [customization, setCustomization] = useState("");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showSEOGuidance, setShowSEOGuidance] = useState(false);

  const handleCustomize = (e: React.FormEvent) => {
    e.preventDefault();
    if (customization.trim()) {
      onCustomize(customization);
      setCustomization("");
    }
  };

  const renderSection = (section: OutlineSection, depth: number = 0) => {
    const isEditing = editingSection === section.id;

    return (
      <div
        key={section.id}
        className={`pl-${depth * 4} py-2 ${
          isEditing ? "bg-purple-50" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={section.title}
                onChange={(e) =>
                  onUpdateSection(section.id, { title: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            ) : (
              <h3
                className={`font-medium ${
                  section.type === "h1"
                    ? "text-xl"
                    : section.type === "h2"
                    ? "text-lg"
                    : section.type === "h3"
                    ? "text-base"
                    : "text-sm"
                }`}
              >
                {section.title}
              </h3>
            )}

            {isEditing ? (
              <textarea
                value={section.content}
                onChange={(e) =>
                  onUpdateSection(section.id, { content: e.target.value })
                }
                rows={3}
                className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-600">{section.content}</p>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              {section.keywords.primary.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {keyword}
                </span>
              ))}
            </div>

            {isEditing && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Key Points
                  </label>
                  <div className="mt-1">
                    {section.keyPoints.map((point, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => {
                            const newPoints = [...section.keyPoints];
                            newPoints[index] = e.target.value;
                            onUpdateSection(section.id, {
                              keyPoints: newPoints,
                            });
                          }}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newPoints = section.keyPoints.filter(
                              (_, i) => i !== index
                            );
                            onUpdateSection(section.id, {
                              keyPoints: newPoints,
                            });
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSection(section.id, {
                          keyPoints: [...section.keyPoints, ""],
                        })
                      }
                      className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                    >
                      Add Key Point
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Word Count
                  </label>
                  <input
                    type="number"
                    value={section.recommendedWordCount}
                    onChange={(e) =>
                      onUpdateSection(section.id, {
                        recommendedWordCount: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setEditingSection(isEditing ? null : section.id)}
              className="text-purple-600 hover:text-purple-700"
            >
              {isEditing ? "Save" : "Edit"}
            </button>
            <button
              type="button"
              onClick={() => onRemoveSection(section.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>

        {section.children && (
          <div className="mt-2">
            {section.children.map((child) => renderSection(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Content Outline
          </h2>
          <div className="mt-4 space-y-4">
            {outline.sections.map((section) => renderSection(section))}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() =>
                onAddSection(null, {
                  id: crypto.randomUUID(),
                  title: "New Section",
                  type: "h2",
                  content: "",
                  keyPoints: [],
                  recommendedWordCount: 300,
                  keywords: {
                    primary: [],
                    secondary: [],
                    semantic: [],
                  },
                  children: [],
                })
              }
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Add Section
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">
            Customize Outline
          </h3>
          <form onSubmit={handleCustomize} className="mt-4">
            <textarea
              value={customization}
              onChange={(e) => setCustomization(e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              placeholder="Describe how you'd like to modify the outline..."
            />
            <div className="mt-3">
              <button
                type="submit"
                disabled={isLoading || !customization.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Customizing..." : "Customize"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <button
            type="button"
            onClick={() => setShowSEOGuidance(!showSEOGuidance)}
            className="flex justify-between w-full"
          >
            <h3 className="text-lg font-medium text-gray-900">SEO Guidance</h3>
            <span className="ml-2 text-purple-600">
              {showSEOGuidance ? "Hide" : "Show"}
            </span>
          </button>

          {showSEOGuidance && (
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-700">
                  Keyword Placements
                </h4>
                <div className="mt-2 space-y-2">
                  {Object.entries(outline.seoGuidance.keywordPlacements).map(
                    ([keyword, data]) => (
                      <div key={keyword} className="text-sm">
                        <span className="font-medium">{keyword}:</span>{" "}
                        {data.recommended} occurrences in{" "}
                        {data.sections.join(", ")}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Content Gaps</h4>
                <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                  {outline.seoGuidance.contentGaps.map((gap) => (
                    <li key={gap}>{gap}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">
                  Competitor Insights
                </h4>
                <div className="mt-2 space-y-2 text-sm text-gray-600">
                  <p>
                    Average sections:{" "}
                    {outline.seoGuidance.competitorInsights.averageSectionCount}
                  </p>
                  <div>
                    <p className="font-medium">Common Headings:</p>
                    <ul className="list-disc list-inside">
                      {outline.seoGuidance.competitorInsights.commonHeadings.map(
                        (heading) => (
                          <li key={heading}>{heading}</li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Missing Topics:</p>
                    <ul className="list-disc list-inside">
                      {outline.seoGuidance.competitorInsights.missingTopics.map(
                        (topic) => (
                          <li key={topic}>{topic}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onGenerateContent}
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Generating..." : "Generate Blog Content"}
        </button>
      </div>
    </div>
  );
}
