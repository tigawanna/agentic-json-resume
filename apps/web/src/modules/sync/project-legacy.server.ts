import "@tanstack/react-start/server-only";

import { db } from "@/lib/drizzle/client";
import {
  resume,
  resumeAiChat,
  resumeAiConversation,
  resumeAiMessage,
  resumeCertification,
  resumeCertificationItem,
  resumeContact,
  resumeContactItem,
  resumeEducation,
  resumeEducationBullet,
  resumeEducationItem,
  resumeExperience,
  resumeExperienceBullet,
  resumeExperienceItem,
  resumeLanguage,
  resumeLanguageItem,
  resumeLink,
  resumeLinkItem,
  resumeNote,
  resumeNoteItem,
  resumeProject,
  resumeProjectItem,
  resumeSection,
  resumeSkill,
  resumeSkillGroup,
  resumeSkillGroupItem,
  resumeSummary,
  resumeSummaryItem,
  resumeTalk,
  resumeTalkItem,
  resumeVolunteer,
  resumeVolunteerItem,
  savedProject,
  syncBackend,
  syncEvent,
} from "@/lib/drizzle/scheam";
import { eq, getTableColumns, isNull } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

const SKIP_COLLECTIONS = new Set(["settings"]);

const tablesByCollection = {
  resume,
  resumeSection,
  resumeExperience,
  resumeExperienceItem,
  resumeExperienceBullet,
  resumeEducation,
  resumeEducationItem,
  resumeEducationBullet,
  resumeSkillGroup,
  resumeSkillGroupItem,
  resumeSkill,
  resumeContact,
  resumeContactItem,
  resumeProject,
  resumeProjectItem,
  resumeSummary,
  resumeSummaryItem,
  resumeNote,
  resumeNoteItem,
  resumeLink,
  resumeLinkItem,
  resumeLanguage,
  resumeLanguageItem,
  resumeCertification,
  resumeCertificationItem,
  resumeVolunteer,
  resumeVolunteerItem,
  resumeTalk,
  resumeTalkItem,
  resumeAiChat,
  resumeAiConversation,
  resumeAiMessage,
  savedProject,
} satisfies Record<string, SQLiteTable>;

type ProjectableCollectionId = keyof typeof tablesByCollection;

function isProjectableCollectionId(id: string): id is ProjectableCollectionId {
  return id in tablesByCollection;
}

function parsePayload(raw: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(raw);
  if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Event payload is not an object");
  }
  return parsed as Record<string, unknown>;
}

function coerceColumnValue(columnName: string, value: unknown): unknown {
  if (columnName === "createdAt" || columnName === "updatedAt") {
    if (typeof value === "number") return new Date(value);
    if (value instanceof Date) return value;
  }
  return value;
}

function rowValuesForTable(
  table: SQLiteTable,
  payload: Record<string, unknown>,
  ownerUserId: string,
): Record<string, unknown> {
  const columns = getTableColumns(table);
  const row: Record<string, unknown> = {};
  for (const columnName of Object.keys(columns)) {
    if (columnName === "embedding") continue;
    if (columnName in payload) {
      row[columnName] = coerceColumnValue(columnName, payload[columnName]);
    }
  }
  if ("userId" in columns) {
    row.userId = ownerUserId;
  }
  return row;
}

async function applyEvent(row: typeof syncEvent.$inferSelect): Promise<void> {
  if (SKIP_COLLECTIONS.has(row.collectionId)) return;
  if (!isProjectableCollectionId(row.collectionId)) {
    throw new Error(`Unknown collection for projection: ${row.collectionId}`);
  }

  const table = tablesByCollection[row.collectionId];
  const columns = getTableColumns(table);
  const idColumn = columns.id;
  if (!idColumn) throw new Error(`Table ${row.collectionId} has no id column`);

  if (row.type === "delete") {
    await db.delete(table).where(eq(idColumn, row.key));
    return;
  }

  const payload = parsePayload(row.payload);
  const values = rowValuesForTable(table, payload, row.userId);
  values.id = row.key;

  if (row.type === "insert") {
    await db
      .insert(table)
      .values(values as never)
      .onConflictDoUpdate({
        target: idColumn,
        set: values as never,
      });
    return;
  }

  const existing = await db
    .select({ id: idColumn })
    .from(table)
    .where(eq(idColumn, row.key))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(table).values(values as never);
    return;
  }
  await db
    .update(table)
    .set(values as never)
    .where(eq(idColumn, row.key));
}

export type ProjectLegacyResult = {
  projected: number;
  lastSeq: number | null;
};

export async function projectUnappliedSyncEvents(limit = 100): Promise<ProjectLegacyResult> {
  const pending = await db
    .select()
    .from(syncEvent)
    .where(isNull(syncEvent.projectedAt))
    .orderBy(syncEvent.globalSeq)
    .limit(limit);

  let projected = 0;
  let lastSeq: number | null = null;

  for (const event of pending) {
    await applyEvent(event);
    const now = new Date();
    await db
      .update(syncEvent)
      .set({ projectedAt: now })
      .where(eq(syncEvent.globalSeq, event.globalSeq));
    await db
      .update(syncBackend)
      .set({ lastProjectedSeq: event.globalSeq })
      .where(eq(syncBackend.id, 1));
    projected += 1;
    lastSeq = event.globalSeq;
  }

  return { projected, lastSeq };
}
