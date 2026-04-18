import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { resume } from "./resume";
import { embeddable, timestamps } from "./shared-columns";

export const resumeCertification = sqliteTable(
  "resume_certification",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resume.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    issuer: text("issuer").default("").notNull(),
    date: text("date").default("").notNull(),
    url: text("url").default("").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...embeddable,
    ...timestamps,
  },
  (table) => [index("resume_certification_resumeId_idx").on(table.resumeId)],
);
