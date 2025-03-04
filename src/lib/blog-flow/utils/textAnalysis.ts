import { BlogContentSection } from "../types/generation";

export function countWords(text: string): number {
  // Remove markdown headers
  text = text.replace(/#{1,6}\s+/g, "");

  // Remove markdown links but keep the text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Remove markdown images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/`[^`]*`/g, "");

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, "");

  // Remove special characters and extra whitespace
  text = text.replace(/[*_~`]/g, "");

  // Split by whitespace and filter out empty strings
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  return words.length;
}

export function calculateReadabilityScore(text: string): number {
  // Simple readability score based on average words per sentence
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const totalWords = countWords(text);

  if (sentences.length === 0) return 0;

  const avgWordsPerSentence = totalWords / sentences.length;
  // Score between 0 and 1, with 1 being most readable (15-20 words per sentence)
  const score = Math.max(
    0,
    Math.min(1, 1 - Math.abs(avgWordsPerSentence - 17.5) / 17.5)
  );

  return score;
}

export function calculateKeywordDensity(text: string, keyword: string): number {
  const totalWords = countWords(text);
  if (totalWords === 0) return 0;

  const keywordRegex = new RegExp(`\\b${keyword}\\b`, "gi");
  const keywordCount = (text.match(keywordRegex) || []).length;

  return keywordCount / totalWords;
}

interface ExternalLink {
  text: string;
  url: string;
  relevance: number;
}

interface HeadingLink {
  heading: string;
  level: number;
  links: ExternalLink[];
}

export async function findRelevantLinks(
  text: string,
  topic: string
): Promise<ExternalLink[]> {
  try {
    // Extract key phrases from the text for searching
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const keyPhrases = sentences
      .map((s) => {
        // Remove markdown and special characters
        const cleaned = s
          .replace(/[#*_~`\[\]()]/g, "")
          .replace(/\s+/g, " ")
          .trim();
        return cleaned;
      })
      .filter((s) => s.length > 30); // Only consider substantial sentences

    // Get the most representative sentence for this section
    const mainPhrase = keyPhrases[0] || topic;

    // Search for relevant content using Google Search API
    const searchQuery = encodeURIComponent(`${mainPhrase} ${topic}`);
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      console.warn("Google Search API credentials not found");
      return [];
    }

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${searchQuery}&num=5`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }

    const data = await response.json();

    // Process and filter results
    const links: ExternalLink[] =
      data.items
        ?.filter((item: any) => {
          // Filter out social media, video platforms, etc.
          const excludedDomains = [
            "youtube.com",
            "facebook.com",
            "twitter.com",
            "instagram.com",
          ];
          return !excludedDomains.some((domain) => item.link.includes(domain));
        })
        .map((item: any) => ({
          text: item.title,
          url: item.link,
          relevance: calculateRelevance(item.snippet || "", mainPhrase),
        }))
        .sort((a: ExternalLink, b: ExternalLink) => b.relevance - a.relevance)
        .slice(0, 3) || [];

    return links;
  } catch (error) {
    console.error("Error finding relevant links:", error);
    return [];
  }
}

function calculateRelevance(text: string, query: string): number {
  const words = new Set(query.toLowerCase().split(/\s+/));
  const textWords = text.toLowerCase().split(/\s+/);
  let matches = 0;

  textWords.forEach((word) => {
    if (words.has(word)) matches++;
  });

  return matches / words.size;
}

export function insertLinks(content: string, links: ExternalLink[]): string {
  if (links.length === 0) return content;

  let modifiedContent = content;
  const paragraphs = content.split("\n\n");

  // Try to distribute links across different paragraphs
  links.forEach((link, index) => {
    const targetParagraph = paragraphs[index % paragraphs.length];
    if (!targetParagraph) return;

    // Find a suitable sentence for the link
    const sentences = targetParagraph.split(/(?<=[.!?])\s+/);
    const sentenceIndex = sentences.findIndex(
      (s) => s.length > 30 && !s.includes("](") && !s.includes("```")
    );

    if (sentenceIndex !== -1) {
      // Insert the link at the end of the sentence
      const sentence = sentences[sentenceIndex];
      const lastPeriod = sentence.lastIndexOf(".");
      const insertPoint = lastPeriod !== -1 ? lastPeriod : sentence.length;

      const linkedText = `${sentence.slice(0, insertPoint)} [Learn more about ${
        link.text
      }](${link.url})${sentence.slice(insertPoint)}`;
      sentences[sentenceIndex] = linkedText;

      // Update the paragraph in the content
      paragraphs[index % paragraphs.length] = sentences.join(" ");
      modifiedContent = paragraphs.join("\n\n");
    }
  });

  return modifiedContent;
}

export async function findHeadingLinks(
  content: string
): Promise<HeadingLink[]> {
  // Regular expression to match markdown headings
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headingLinks: HeadingLink[] = [];

  // Find all headings in the content
  const matches = Array.from(content.matchAll(headingRegex));

  // Process each heading
  for (const match of matches) {
    const level = match[1].length; // Number of # symbols
    const heading = match[2].trim();

    // Only process h2 and h3 headings
    if (level >= 2 && level <= 3) {
      try {
        const links = await findRelevantLinks(heading, heading);
        headingLinks.push({
          heading,
          level,
          links: links.slice(0, 2), // Limit to top 2 most relevant links per heading
        });
      } catch (error) {
        console.error(`Error finding links for heading "${heading}":`, error);
      }
    }
  }

  return headingLinks;
}

export function insertHeadingLinks(
  content: string,
  headingLinks: HeadingLink[]
): string {
  let modifiedContent = content;

  for (const { heading, level, links } of headingLinks) {
    if (links.length === 0) continue;

    // Create a reference section for the heading
    const referenceSection = `\n\n**Related Resources:**\n${links
      .map((link) => `- [${link.text}](${link.url})`)
      .join("\n")}`;

    // Find the heading in the content
    const headingRegex = new RegExp(
      `^${"#".repeat(level)}\\s+${escapeRegExp(heading)}\\s*$(.*?)(?=^#|$)`,
      "gms"
    );

    // Insert the reference section at the end of the heading's content
    modifiedContent = modifiedContent.replace(
      headingRegex,
      (match, sectionContent) => {
        return `${"#".repeat(
          level
        )} ${heading}${sectionContent}${referenceSection}`;
      }
    );
  }

  return modifiedContent;
}

// Utility function to escape special characters in regex
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Update the existing formatSectionContent function to include heading links
export function formatSectionWithLinks(
  section: BlogContentSection,
  depth: number = 1
): Promise<string> {
  return new Promise<string>(async (resolve) => {
    try {
      // First format the content with the heading
      const heading = "#".repeat(depth);
      const formattedContent = `${heading} ${section.title}\n\n${section.content}\n\n`;

      // Find and add links for headings
      const headingLinks = await findHeadingLinks(formattedContent);
      const contentWithLinks = insertHeadingLinks(
        formattedContent,
        headingLinks
      );

      resolve(contentWithLinks);
    } catch (error) {
      console.error("Error formatting section with links:", error);
      // Fallback to basic formatting if link addition fails
      resolve(`${heading} ${section.title}\n\n${section.content}\n\n`);
    }
  });
}
