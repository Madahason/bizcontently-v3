import { SerpData } from "../types/generation";
import { getCachedSearch, setCachedSearch } from "./searchCache";

interface SearchConfig {
  country?: string;
  language?: string;
  safeSearch?: "off" | "medium" | "high";
  dateRestrict?: string;
  siteSearch?: string; // Search within specific site
  exactTerms?: string; // Words or phrases that should appear exactly
  excludeTerms?: string; // Words to exclude
  fileType?: string; // Specific file types (pdf, doc, etc.)
  sort?: "date" | "relevance";
  start?: number; // Pagination start index
  // New configurations
  rights?:
    | "cc_publicdomain"
    | "cc_attribute"
    | "cc_sharealike"
    | "cc_noncommercial"
    | "cc_nonderived";
  searchType?: "image" | "news" | "video";
  imgSize?:
    | "huge"
    | "icon"
    | "large"
    | "medium"
    | "small"
    | "xlarge"
    | "xxlarge";
  imgType?: "clipart" | "face" | "lineart" | "stock" | "photo" | "animated";
  imgColorType?: "color" | "gray" | "mono" | "trans";
  lowRange?: string;
  highRange?: string;
  siteSearchFilter?: "e" | "i"; // "e" excludes, "i" includes sites
  filter?: "0" | "1"; // "0" includes duplicates, "1" omits them
}

const DEFAULT_CONFIG: SearchConfig = {
  country: "us",
  language: "en",
  safeSearch: "medium",
  sort: "relevance",
};

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 100, // Maximum requests per day (free tier)
  requestWindow: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  requestDelay: 1000, // Minimum delay between requests (1 second)
};

interface RateLimitInfo {
  timestamp: number;
  count: number;
}

class GoogleSearchError extends Error {
  constructor(message: string, public code?: string, public status?: number) {
    super(message);
    this.name = "GoogleSearchError";
  }
}

// Rate limiting storage
const getRateLimitInfo = (): RateLimitInfo => {
  try {
    const info = localStorage.getItem("google_search_rate_limit");
    if (info) {
      return JSON.parse(info);
    }
  } catch (error) {
    console.warn("Error reading rate limit info:", error);
  }
  return { timestamp: Date.now(), count: 0 };
};

const updateRateLimit = (info: RateLimitInfo) => {
  try {
    localStorage.setItem("google_search_rate_limit", JSON.stringify(info));
  } catch (error) {
    console.warn("Error updating rate limit info:", error);
  }
};

const checkRateLimit = (): boolean => {
  const info = getRateLimitInfo();
  const now = Date.now();

  // Reset counter if window has passed
  if (now - info.timestamp > RATE_LIMIT.requestWindow) {
    updateRateLimit({ timestamp: now, count: 0 });
    return true;
  }

  // Check if we've exceeded the limit
  if (info.count >= RATE_LIMIT.maxRequests) {
    return false;
  }

  // Update counter
  updateRateLimit({ timestamp: info.timestamp, count: info.count + 1 });
  return true;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Add after the DEFAULT_CONFIG
const validateSearchConfig = (config: SearchConfig): SearchConfig => {
  const validated: SearchConfig = { ...DEFAULT_CONFIG };

  // Validate country (ISO 3166-1 alpha-2)
  if (config.country?.match(/^[A-Z]{2}$/i)) {
    validated.country = config.country.toLowerCase();
  }

  // Validate language (ISO 639-1)
  if (config.language?.match(/^[a-z]{2}$/i)) {
    validated.language = config.language.toLowerCase();
  }

  // Validate date restrict format (d[number], w[number], m[number], y[number])
  if (config.dateRestrict?.match(/^[dwmy]\d+$/)) {
    validated.dateRestrict = config.dateRestrict;
  }

  // Validate numeric ranges
  if (config.lowRange && config.highRange) {
    const low = parseInt(config.lowRange);
    const high = parseInt(config.highRange);
    if (!isNaN(low) && !isNaN(high) && low < high) {
      validated.lowRange = config.lowRange;
      validated.highRange = config.highRange;
    }
  }

  // Copy over valid enum values
  if (
    config.safeSearch &&
    ["off", "medium", "high"].includes(config.safeSearch)
  ) {
    validated.safeSearch = config.safeSearch;
  }

  if (config.sort && ["date", "relevance"].includes(config.sort)) {
    validated.sort = config.sort;
  }

  if (
    config.rights &&
    [
      "cc_publicdomain",
      "cc_attribute",
      "cc_sharealike",
      "cc_noncommercial",
      "cc_nonderived",
    ].includes(config.rights)
  ) {
    validated.rights = config.rights;
  }

  if (
    config.searchType &&
    ["image", "news", "video"].includes(config.searchType)
  ) {
    validated.searchType = config.searchType;
  }

  // Copy over string values if they exist
  if (config.siteSearch) validated.siteSearch = config.siteSearch;
  if (config.exactTerms) validated.exactTerms = config.exactTerms;
  if (config.excludeTerms) validated.excludeTerms = config.excludeTerms;
  if (config.fileType) validated.fileType = config.fileType;

  // Validate start parameter
  if (
    typeof config.start === "number" &&
    config.start >= 1 &&
    config.start <= 100
  ) {
    validated.start = config.start;
  }

  return validated;
};

// Update the fetchGoogleSearchData function to use validation
export async function fetchGoogleSearchData(
  query: string,
  config: SearchConfig = DEFAULT_CONFIG
): Promise<SerpData | null> {
  try {
    const validatedConfig = validateSearchConfig(config);

    // Check cache first
    const cachedData = getCachedSearch(query);
    if (cachedData) {
      console.log("Returning cached search results for:", query);
      return cachedData;
    }

    // Check rate limit
    if (!checkRateLimit()) {
      throw new GoogleSearchError(
        "Daily API quota exceeded",
        "RATE_LIMIT_EXCEEDED"
      );
    }

    // Add delay between requests
    await delay(RATE_LIMIT.requestDelay);

    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      throw new GoogleSearchError(
        "Google Search API configuration not found",
        "CONFIG_MISSING"
      );
    }

    // Validate API key format
    if (!apiKey.startsWith("AIza")) {
      throw new GoogleSearchError(
        "Invalid API key format",
        "INVALID_API_KEY_FORMAT"
      );
    }

    const params = new URLSearchParams({
      key: apiKey,
      cx: searchEngineId,
      q: query,
      num: "10",
      gl: validatedConfig.country || DEFAULT_CONFIG.country!,
      hl: validatedConfig.language || DEFAULT_CONFIG.language!,
      safe: validatedConfig.safeSearch || DEFAULT_CONFIG.safeSearch!,
      sort: validatedConfig.sort || DEFAULT_CONFIG.sort!,
      ...(validatedConfig.dateRestrict && {
        dateRestrict: validatedConfig.dateRestrict,
      }),
      ...(validatedConfig.siteSearch && {
        siteSearch: validatedConfig.siteSearch,
      }),
      ...(validatedConfig.exactTerms && {
        exactTerms: validatedConfig.exactTerms,
      }),
      ...(validatedConfig.excludeTerms && {
        excludeTerms: validatedConfig.excludeTerms,
      }),
      ...(validatedConfig.fileType && { fileType: validatedConfig.fileType }),
      ...(validatedConfig.start && { start: validatedConfig.start.toString() }),
      ...(validatedConfig.rights && { rights: validatedConfig.rights }),
      ...(validatedConfig.searchType && {
        searchType: validatedConfig.searchType,
      }),
      ...(validatedConfig.imgSize && { imgSize: validatedConfig.imgSize }),
      ...(validatedConfig.imgType && { imgType: validatedConfig.imgType }),
      ...(validatedConfig.imgColorType && {
        imgColorType: validatedConfig.imgColorType,
      }),
      ...(validatedConfig.lowRange && { lowRange: validatedConfig.lowRange }),
      ...(validatedConfig.highRange && {
        highRange: validatedConfig.highRange,
      }),
      ...(validatedConfig.siteSearchFilter && {
        siteSearchFilter: validatedConfig.siteSearchFilter,
      }),
      ...(validatedConfig.filter && { filter: validatedConfig.filter }),
    });

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?${params}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new GoogleSearchError(
        data.error?.message || "Google Search API error",
        data.error?.status,
        response.status
      );
    }

    // Validate response structure
    if (!data.items && !data.searchInformation) {
      throw new GoogleSearchError(
        "Invalid API response format",
        "INVALID_RESPONSE"
      );
    }

    // Extract and format the data to match our SerpData interface
    const serpData: SerpData = {
      organicResults: (data.items || []).map((item: any, index: number) => ({
        title: item.title || "",
        link: item.link || "",
        snippet: item.snippet || "",
        position: index + 1,
      })),
      featuredSnippets:
        data.items
          ?.filter(
            (item: any) =>
              item.pagemap?.metatags?.[0]?.["og:description"] ||
              item.pagemap?.metatags?.[0]?.["description"]
          )
          .map(
            (item: any) =>
              item.pagemap.metatags[0]["og:description"] ||
              item.pagemap.metatags[0]["description"]
          ) || [],
      relatedSearches:
        data.queries?.relatedSearches?.map((item: any) => item.title) || [],
      totalResults: parseInt(data.searchInformation?.totalResults || "0"),
    };

    // Cache the results
    setCachedSearch(query, serpData);

    return serpData;
  } catch (error) {
    if (error instanceof GoogleSearchError) {
      console.error(`Google Search Error (${error.code}):`, error.message);
    } else {
      console.error("Unexpected error during Google Search:", error);
    }
    return null;
  }
}
