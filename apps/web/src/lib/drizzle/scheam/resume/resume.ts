import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../auth-schema";
import { embeddable, timestamps } from "./shared-columns";

export const resume = sqliteTable(
  "resume",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Internal label for this resume version (e.g. "Frontend 2025") */
    name: text("name").notNull(),
    /** Display name on the resume itself */
    fullName: text("full_name").default("").notNull(),
    /** Professional headline / title */
    headline: text("headline").default("").notNull(),
    /** Internal notes about this resume */
    description: text("description").default("").notNull(),
    /** Target job description used for AI tailoring */
    jobDescription: text("job_description").default("").notNull(),
    /** Template used for rendering (classic, sidebar, accent, modern) */
    templateId: text("template_id").default("classic").notNull(),
    ...embeddable,
    ...timestamps,
  },
  (table) => [
    index("resume_userId_idx").on(table.userId),
    index("resume_updatedAt_idx").on(table.updatedAt),
  ],
);

export const resumeSection = sqliteTable(
  "resume_section",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resume.id, { onDelete: "cascade" }),
    /** Section key: summary, experience, education, projects, skills, talks, certifications, etc. */
    key: text("key").notNull(),
    /** Custom display title (defaults to section key titlecased) */
    title: text("title").notNull(),
    enabled: integer("enabled", { mode: "boolean" }).default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps,
  },
  (table) => [
    index("resume_section_resumeId_idx").on(table.resumeId),
    index("resume_section_resumeId_key_idx").on(table.resumeId, table.key),
  ],
);
