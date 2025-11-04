/* eslint-disable n/no-process-env */
import {StandardSchemaV1, createEnv} from "@t3-oss/env-core";
import {z} from "zod/v4";

export const env = createEnv({
  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_APP_URL: z.url().optional(),
  },
  server: {
    AUTH_SECRET: z.string(),
    DATABASE_URL: z.url(),
  },
  shared: {
    NEXT_RUNTIME: z.enum(["edge", "nodejs"]).optional(),
    NODE_ENV: z.enum(["development", "test", "production"]),
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

  onInvalidAccess: (variable: string) => {
    console.error(
      `🚫 Attempted to access a server-side environment variable [${variable}] on the client`
    );
    process.exit(1);
  },
});
