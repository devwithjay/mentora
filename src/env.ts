/* eslint-disable n/no-process-env */
import {StandardSchemaV1, createEnv} from "@t3-oss/env-core";
import {z} from "zod/v4";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    DATABASE_URL: z.url(),
    AUTH_SECRET: z.string(),
    NEXT_RUNTIME: z.enum(["edge", "nodejs"]).optional(),
    LOG_LEVEL: z
      .enum(["debug", "info", "warn", "error"])
      .default("info")
      .optional(),
  },

  emptyStringAsUndefined: true,
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    LOG_LEVEL: process.env.LOG_LEVEL,
  },

  onValidationError: (issues: readonly StandardSchemaV1.Issue[]) => {
    console.error("❌ Invalid environment variables:", issues);
    process.exit(1);
  },

  // eslint-disable-next-line
  onInvalidAccess: (variable: string) => {
    console.error(
      "🚫 Attempted to access a server-side environment variable on the client"
    );
    process.exit(1);
  },
});
