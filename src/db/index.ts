import {neon} from "@neondatabase/serverless";
import {drizzle} from "drizzle-orm/neon-http";
import {drizzle as drizzlePg} from "drizzle-orm/node-postgres";
import {Pool} from "pg";

import {env} from "@/env";

let db;

if (env.NODE_ENV === "development") {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
  });

  db = drizzlePg(pool);
} else {
  const sql = neon(env.DATABASE_URL);
  db = drizzle({client: sql});
}

export {db};
export type DB = typeof db;
