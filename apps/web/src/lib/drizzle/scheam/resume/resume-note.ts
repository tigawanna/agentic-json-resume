import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { resume } from "./resume";
import { embeddable, timestamps } from "./shared-columns";

/** Footer copy: condensed cover letter, addendum, or other printed notes. */
export const resumeNote = sqliteTable(
  "resume_note",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    /** Section heading on the page, e.g. "Notes" or "Cover letter" */
    label: text("label").default("Notes").notNull(),
    text: text("text").default("").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...embeddable,
    ...timestamps,
    userId: text("user_id"),
  },
  (table) => [index("resume_note_userId_idx").on(table.userId)],
);

export const resumeNoteItem = sqliteTable(
  "resume_note_item",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resume.id, { onDelete: "cascade" }),
    noteId: text("note_id")
      .notNull()
      .references(() => resumeNote.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps,
  },
  (table) => [
    index("resume_note_item_resumeId_idx").on(table.resumeId),
    index("resume_note_item_noteId_idx").on(table.noteId),
    uniqueIndex("resume_note_item_unique_idx").on(table.resumeId, table.noteId),
  ],
);
