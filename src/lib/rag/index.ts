/* eslint-disable */
import {searchSimilarGitaPassages} from "@/lib/rag/qdrant-embeddings";

export type GitaChunk = {
  id: string;
  chapter?: number;
  verse?: number;
  text: string;
  score?: number;
};

export async function getRelevantPassages(
  query: string,
  options?: {topK?: number}
): Promise<GitaChunk[]> {
  const topK = options?.topK ?? 6;

  try {
    const results = await searchSimilarGitaPassages(query, topK);

    return results.map((result: any) => {
      const payload = result.metadata ?? {};

      return {
        id: result.id,
        chapter: payload.chapter,
        verse: payload.verse,

        // NEW — Build a text block from verse data
        text:
          buildVerseBlock(payload) ||
          payload.raw ||
          payload.translation ||
          payload.sanskrit ||
          "",

        score: result.score,
      };
    });
  } catch (error) {
    console.error("Error retrieving relevant passages:", error);
    return [];
  }
}

/**
 * Build clean text block for context (sanskrit + transliteration + translation + purport)
 */
function buildVerseBlock(payload: any): string {
  if (!payload) return "";

  const parts: string[] = [];

  if (payload.sanskrit) {
    parts.push(`Sanskrit:\n${payload.sanskrit}`);
  }

  if (payload.transliteration) {
    parts.push(`Transliteration:\n${payload.transliteration}`);
  }

  if (payload.synonyms) {
    parts.push(`Synonyms:\n${payload.synonyms}`);
  }

  if (payload.translation) {
    parts.push(`Translation:\n${payload.translation}`);
  }

  if (payload.purport) {
    parts.push(`Purport:\n${payload.purport}`);
  }

  return parts.join("\n\n").trim();
}

/**
 * Build final context text for the LLM
 */
export function buildContextText(chunks: GitaChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant passages found in the knowledge base.";
  }

  return chunks
    .map((c, idx) => {
      const reference =
        c.chapter && c.verse
          ? `Bhagavad-gītā ${c.chapter}.${c.verse}`
          : `Excerpt ${idx + 1}`;

      const safeText = c.text?.trim() || "No verse text available";

      return `${reference}:\n${safeText}`;
    })
    .join("\n\n---\n\n");
}
