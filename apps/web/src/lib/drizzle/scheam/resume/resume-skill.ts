import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { resume } from "./resume";
import { embeddable, timestamps } from "./shared-columns";

export const resumeSkillGroup = sqliteTable(
  "resume_skill_group",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resume.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...embeddable,
    ...timestamps,
  },
  (table) => [index("resume_skill_group_resumeId_idx").on(table.resumeId)],
);

export const resumeSkill = sqliteTable(
  "resume_skill",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    groupId: text("group_id")
      .notNull()
      .references(() => resumeSkillGroup.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** Optional proficiency: beginner | intermediate | advanced | expert */
    level: text("level"),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...embeddable,
    ...timestamps,
  },
  (table) => [index("resume_skill_groupId_idx").on(table.groupId)],
);
