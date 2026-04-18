import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { resume } from "./resume";
import { embeddable, timestamps } from "./shared-columns";

export const resumeLanguage = sqliteTable(
  "resume_language",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resume.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** e.g. "native", "fluent", "professional", "conversational", "basic" */
    proficiency: text("proficiency").default("").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...embeddable,
    ...timestamps,
  },
  (table) => [index("resume_language_resumeId_idx").on(table.resumeId)],
);
