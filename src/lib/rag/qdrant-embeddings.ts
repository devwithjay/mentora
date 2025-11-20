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

export async function storeGitaEmbedding(
  chunkId: string,
  text: string,
  metadata?: Record<string, unknown>
) {
  const client = getQdrantClient();

  const embeddingResult = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: text,
  });

  const vector = embeddingResult.embedding;

  await client.upsert(GITA_COLLECTION, {
    points: [
      {
        id: crypto.randomUUID(),
        vector: vector as number[],
        payload: {
          id: chunkId,
          text,
          chapter: metadata?.chapter,
          verse: metadata?.verse,
          sanskrit: metadata?.sanskrit,
          translation: metadata?.translation,
          purport: metadata?.purport,
        },
      },
    ],
  });
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
    text: result.payload?.text as string,
    score: result.score,
    metadata: result.payload,
  }));
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString();
}
