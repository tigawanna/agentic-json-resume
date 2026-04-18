import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { resume } from "./resume";
import { embeddable, timestamps } from "./shared-columns";

export const resumeLink = sqliteTable(
  "resume_link",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resume.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    url: text("url").notNull(),
    /** Optional icon hint (e.g. "github", "linkedin", "globe") */
    icon: text("icon"),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...embeddable,
    ...timestamps,
  },
  (table) => [index("resume_link_resumeId_idx").on(table.resumeId)],
);
