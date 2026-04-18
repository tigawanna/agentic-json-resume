import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { resume } from "./resume";
import { embeddable, timestamps } from "./shared-columns";

export const resumeProject = sqliteTable(
  "resume_project",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resume.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    url: text("url").default("").notNull(),
    homepageUrl: text("homepage_url").default("").notNull(),
    description: text("description").default("").notNull(),
    /** JSON string array of technologies, e.g. '["React","TypeScript"]' */
    tech: text("tech").default("[]").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...embeddable,
    ...timestamps,
  },
  (table) => [index("resume_project_resumeId_idx").on(table.resumeId)],
);
