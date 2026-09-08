import { publicResume } from "@/lib/drizzle/scheam/resume/public-resume";
import { db } from "@/lib/drizzle/client";
import type { ResumeDocumentV1 } from "@/features/resume/resume-schema";
import { and, eq } from "drizzle-orm";

export type PublicResumeDTO = {
  id: string;
  sourceResumeId: string;
  title: string;
  document: ResumeDocumentV1;
  publishedAt: Date;
  updatedAt: Date;
};

function toDto(row: typeof publicResume.$inferSelect): PublicResumeDTO {
  return {
    id: row.id,
    sourceResumeId: row.sourceResumeId,
    title: row.title,
    document: row.document,
    publishedAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getPublicResumeById(id: string): Promise<PublicResumeDTO | null> {
  const rows = await db.select().from(publicResume).where(eq(publicResume.id, id)).limit(1);
  const row = rows[0];
  return row ? toDto(row) : null;
}

export async function getPublicResumeForSource(
  userId: string,
  sourceResumeId: string,
): Promise<PublicResumeDTO | null> {
  const rows = await db
    .select()
    .from(publicResume)
    .where(and(eq(publicResume.userId, userId), eq(publicResume.sourceResumeId, sourceResumeId)))
    .limit(1);
  const row = rows[0];
  return row ? toDto(row) : null;
}

export async function upsertPublicResume(input: {
  userId: string;
  sourceResumeId: string;
  title: string;
  document: ResumeDocumentV1;
}): Promise<PublicResumeDTO> {
  const existing = await getPublicResumeForSource(input.userId, input.sourceResumeId);

  if (existing) {
    const updated = await db
      .update(publicResume)
      .set({
        title: input.title,
        document: input.document,
        updatedAt: new Date(),
      })
      .where(eq(publicResume.id, existing.id))
      .returning();
    const row = updated[0];
    if (!row) throw new Error("Failed to update public résumé");
    return toDto(row);
  }

  const inserted = await db
    .insert(publicResume)
    .values({
      userId: input.userId,
      sourceResumeId: input.sourceResumeId,
      title: input.title,
      document: input.document,
    })
    .returning();
  const row = inserted[0];
  if (!row) throw new Error("Failed to publish résumé");
  return toDto(row);
}

export async function deletePublicResumeForSource(
  userId: string,
  sourceResumeId: string,
): Promise<boolean> {
  const deleted = await db
    .delete(publicResume)
    .where(and(eq(publicResume.userId, userId), eq(publicResume.sourceResumeId, sourceResumeId)))
    .returning({ id: publicResume.id });
  return deleted.length > 0;
}
