import {openai} from "@ai-sdk/openai";
import {embed} from "ai";

import {getQdrantClient} from "@/lib/qdrant-client";

const GITA_COLLECTION = "gita-embeddings";

let collectionInitialized = false;

export async function ensureQdrantCollection() {
  if (collectionInitialized) return;

  const client = getQdrantClient();

  try {
    await client.getCollection(GITA_COLLECTION);
  } catch {
    await client.createCollection(GITA_COLLECTION, {
      vectors: {
        size: 1536,
        distance: "Cosine",
      },
    });
  }

  collectionInitialized = true;
}

export async function searchSimilarGitaPassages(query: string, limit = 6) {
  await ensureQdrantCollection();

  const client = getQdrantClient();

  const embeddingResult = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: query,
  });

  const queryVector = embeddingResult.embedding;

  const results = await client.search(GITA_COLLECTION, {
    vector: queryVector as number[],
    limit,
    with_payload: true,
  });

  return results.map(result => ({
    id: result.payload?.id as string,
    chapter: result.payload?.chapter as number,
    verse: result.payload?.verse as number,
    text: result.payload?.text as string,
    score: result.score,
    metadata: result.payload,
  }));
}
