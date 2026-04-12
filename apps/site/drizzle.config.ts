import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/lib/drizzle/auth-schema.ts", "./src/lib/drizzle/resume-schema.ts"],
  out: "./drizzle/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:./db.sqlite",
  },
});
