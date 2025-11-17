/* eslint-disable n/no-process-env */
import {QdrantClient} from "@qdrant/js-client-rest";

let qdrantClient: QdrantClient | null = null;

export function getQdrantClient(): QdrantClient {
  if (!qdrantClient) {
    const url = process.env.QDRANT_URL!;
    const apiKey = process.env.QDRANT_API_KEY!;

    if (!url || !apiKey) {
      throw new Error(
        "QDRANT_URL and QDRANT_API_KEY environment variables are required"
      );
    }

    qdrantClient = new QdrantClient({
      url,
      apiKey,
    });
  }

  return qdrantClient;
}
