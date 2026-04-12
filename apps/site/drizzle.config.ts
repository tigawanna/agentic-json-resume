import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/drizzle/auth-schema.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
});
