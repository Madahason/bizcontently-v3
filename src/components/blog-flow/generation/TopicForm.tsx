import { useState } from "react";
import { TopicGenerationParams } from "@/lib/blog-flow/types/generation";

interface TopicFormProps {
  onSubmit: (params: TopicGenerationParams) => void;
  isLoading: boolean;
}

export function TopicForm({ onSubmit, isLoading }: TopicFormProps) {
  const [params, setParams] = useState<TopicGenerationParams>({
    mainTopic: "",
    niche: "",
    targetAudience: "",
    contentLength: "medium",
    difficulty: "intermediate",
    includeSerpData: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(params);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="mainTopic"
            className="block text-sm font-medium text-gray-700"
          >
            Main Topic *
          </label>
          <input
            type="text"
            id="mainTopic"
            name="mainTopic"
            required
            value={params.mainTopic}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            placeholder="Enter your main topic"
          />
        </div>

        <div>
          <label
            htmlFor="niche"
            className="block text-sm font-medium text-gray-700"
          >
            Niche (Optional)
          </label>
          <input
            type="text"
            id="niche"
            name="niche"
            value={params.niche}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            placeholder="e.g., Technology, Health, Finance"
          />
        </div>

        <div>
          <label
            htmlFor="targetAudience"
            className="block text-sm font-medium text-gray-700"
          >
            Target Audience (Optional)
          </label>
          <input
            type="text"
            id="targetAudience"
            name="targetAudience"
            value={params.targetAudience}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            placeholder="e.g., Beginners, Professionals, Students"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="contentLength"
              className="block text-sm font-medium text-gray-700"
            >
              Content Length
            </label>
            <select
              id="contentLength"
              name="contentLength"
              value={params.contentLength}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="difficulty"
              className="block text-sm font-medium text-gray-700"
            >
              Difficulty Level
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={params.difficulty}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeSerpData"
            name="includeSerpData"
            checked={params.includeSerpData}
            onChange={handleChange}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label
            htmlFor="includeSerpData"
            className="ml-2 block text-sm text-gray-700"
          >
            Include search engine data (SERP) for better insights
          </label>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading || !params.mainTopic}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Generating Topics..." : "Generate Topics"}
        </button>
      </div>
    </form>
  );
}
