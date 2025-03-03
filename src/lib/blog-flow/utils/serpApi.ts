import { SerpData } from "../types/generation";
import { fetchGoogleSearchData } from "./googleSearch";

export async function fetchSerpData(query: string): Promise<SerpData | null> {
  try {
    // Try SerpApi first
    const serpApiKey = process.env.SERPAPI_KEY;
    if (serpApiKey) {
      const params = new URLSearchParams({
        api_key: serpApiKey,
        q: query,
        engine: "google",
        num: "10", // Number of results
        gl: "us", // Country code (US results)
      });

      const response = await fetch(`https://serpapi.com/search.json?${params}`);
      const data = await response.json();

      if (!response.ok) {
        console.error("SerpApi error:", data);
        // Fall back to Google Search API
        return fetchGoogleSearchData(query);
      }

      // Extract and format the data
      const serpData: SerpData = {
        organicResults: (data.organic_results || []).map((result: any) => ({
          title: result.title,
          link: result.link,
          snippet: result.snippet,
          position: result.position,
        })),
        featuredSnippets: data.answer_box ? [data.answer_box.snippet] : [],
        relatedSearches: (data.related_searches || []).map(
          (item: any) => item.query
        ),
        totalResults: parseInt(data.search_information?.total_results || "0"),
      };

      return serpData;
    }

    // If no SerpApi key, use Google Search API
    return fetchGoogleSearchData(query);
  } catch (error) {
    console.error("Error fetching SERP data:", error);
    // Try Google Search API as fallback
    return fetchGoogleSearchData(query);
  }
}
