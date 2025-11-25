import {searchSimilarGitaPassages} from "@/lib/rag/qdrant-embeddings";

export type GitaChunk = {
  id: string;
  chapter?: number;
  verse?: number;
  text: string;
  score?: number;
  metadata?: Record<string, unknown>;
};

export async function getRelevantPassages(
  query: string,
  options?: {topK?: number}
): Promise<GitaChunk[]> {
  const topK = options?.topK ?? 6;

  try {
    const results = await searchSimilarGitaPassages(query, topK);

    return results.map(result => ({
      id: result.id,
      chapter: result.chapter,
      verse: result.verse,
      text: result.text || "",
      score: result.score,
      metadata: result.metadata || undefined,
    }));
  } catch (error) {
    console.error("Error retrieving relevant passages:", error);
    return [];
  }
}

function buildVerseBlock(payload: Record<string, unknown>): string {
  if (!payload) return "";

  const parts: string[] = [];

  if (
    typeof payload.chapter === "number" &&
    typeof payload.verse === "number"
  ) {
    parts.push(`**Bhagavad-gītā ${payload.chapter}.${payload.verse}**\n`);
  }

  if (typeof payload.sanskrit === "string" && payload.sanskrit) {
    parts.push(`**Sanskrit:**\n${payload.sanskrit}`);
  }

  if (typeof payload.transliteration === "string" && payload.transliteration) {
    parts.push(`**Transliteration:**\n${payload.transliteration}`);
  }

  if (typeof payload.synonyms === "string" && payload.synonyms) {
    parts.push(`**Synonyms:**\n${payload.synonyms}`);
  }

  if (typeof payload.translation === "string" && payload.translation) {
    parts.push(`**Translation:**\n${payload.translation}`);
  }

  if (typeof payload.purport === "string" && payload.purport) {
    parts.push(`**Purport:**\n${payload.purport}`);
  }

  return parts.join("\n\n").trim();
}

export function buildContextText(chunks: GitaChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant passages found in the knowledge base.";
  }

  return chunks
    .map(c => {
      const formattedVerse = buildVerseBlock(c.metadata || {});

      return formattedVerse || c.text || "No verse text available";
    })
    .join("\n\n---\n\n");
}
