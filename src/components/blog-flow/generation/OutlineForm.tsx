import { useState } from "react";
import {
  OutlineGenerationParams,
  TopicIdea,
} from "@/lib/blog-flow/types/generation";

interface OutlineFormProps {
  selectedTopic: TopicIdea;
  onSubmit: (params: OutlineGenerationParams) => void;
  isLoading: boolean;
}

export function OutlineForm({
  selectedTopic,
  onSubmit,
  isLoading,
}: OutlineFormProps) {
  const [params, setParams] = useState<
    Omit<OutlineGenerationParams, "selectedTopic">
  >({
    style: "conversational",
    depth: 2,
    includeIntroConclusion: true,
    includeFAQ: true,
    keywordStrategy: "balanced",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      selectedTopic,
      ...params,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? parseInt(value)
          : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="style"
            className="block text-sm font-medium text-gray-700"
          >
            Content Style
          </label>
          <select
            id="style"
            name="style"
            value={params.style}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          >
            <option value="academic">Academic</option>
            <option value="conversational">Conversational</option>
            <option value="tutorial">Tutorial</option>
            <option value="listicle">Listicle</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Choose the writing style that best fits your audience
          </p>
        </div>

        <div>
          <label
            htmlFor="depth"
            className="block text-sm font-medium text-gray-700"
          >
            Heading Depth
          </label>
          <select
            id="depth"
            name="depth"
            value={params.depth}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          >
            <option value={1}>Simple (H1 only)</option>
            <option value={2}>Standard (H1-H2)</option>
            <option value={3}>Detailed (H1-H3)</option>
            <option value={4}>Complex (H1-H4)</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Select how detailed you want your outline structure to be
          </p>
        </div>

        <div>
          <label
            htmlFor="keywordStrategy"
            className="block text-sm font-medium text-gray-700"
          >
            SEO Strategy
          </label>
          <select
            id="keywordStrategy"
            name="keywordStrategy"
            value={params.keywordStrategy}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          >
            <option value="conservative">
              Conservative (0.5-1.5% density)
            </option>
            <option value="balanced">Balanced (1.5-2.5% density)</option>
            <option value="aggressive">Aggressive (3-4% density)</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Choose how to balance keyword optimization with readability
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeIntroConclusion"
              name="includeIntroConclusion"
              checked={params.includeIntroConclusion}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label
              htmlFor="includeIntroConclusion"
              className="ml-2 block text-sm text-gray-700"
            >
              Include Introduction and Conclusion sections
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeFAQ"
              name="includeFAQ"
              checked={params.includeFAQ}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label
              htmlFor="includeFAQ"
              className="ml-2 block text-sm text-gray-700"
            >
              Add FAQ section based on search trends
            </label>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Generating Outline..." : "Generate Outline"}
        </button>
      </div>
    </form>
  );
}
