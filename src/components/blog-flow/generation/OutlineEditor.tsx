import { useState } from "react";
import {
  OutlineSection,
  OutlineGenerationResponse,
} from "@/lib/blog-flow/types/generation";

interface OutlineEditorProps {
  outline: NonNullable<OutlineGenerationResponse>;
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

  const handleCustomize = (e: React.FormEvent) => {
    e.preventDefault();
    if (customization.trim()) {
      onCustomize(customization);
      setCustomization("");
    }
  };

  const renderSection = (section: OutlineSection, depth: number = 0) => {
    return (
      <div
        key={section.id}
        className={`pl-${depth * 4} py-2 border-l-2 border-gray-200`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => onRemoveSection(section.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <p>{section.content}</p>
          <div className="mt-2">
            <strong>Key Points:</strong>
            <ul className="list-disc list-inside">
              {section.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
        {section.children && section.children.length > 0 && (
          <div className="mt-4">
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
          <h2 className="text-lg font-medium text-gray-900">Content Outline</h2>
          <div className="mt-4 space-y-4">
            {outline.sections.map((section) => renderSection(section))}
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
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              placeholder="Enter your customization request..."
            />
            <div className="mt-4 flex justify-end space-x-4">
              <button
                type="submit"
                disabled={!customization.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
              >
                Customize
              </button>
              <button
                type="button"
                onClick={onGenerateContent}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
              >
                {isLoading ? "Generating..." : "Generate Blog Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
