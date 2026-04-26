import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/drizzle/scheam/**/*.ts",
  out: "./drizzle/migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:./db.sqlite",
    authToken: process.env.DATABASE_AUTH_TOKEN ?? "",
  },
});
