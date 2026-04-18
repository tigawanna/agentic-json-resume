import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { resume } from "./resume";
import { embeddable, timestamps } from "./shared-columns";

export const resumeVolunteer = sqliteTable(
  "resume_volunteer",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resume.id, { onDelete: "cascade" }),
    organization: text("organization").notNull(),
    role: text("role").default("").notNull(),
    startDate: text("start_date").default("").notNull(),
    endDate: text("end_date").default("").notNull(),
    description: text("description").default("").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...embeddable,
    ...timestamps,
  },
  (table) => [index("resume_volunteer_resumeId_idx").on(table.resumeId)],
);
