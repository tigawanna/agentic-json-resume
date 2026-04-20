import "@tanstack/react-start/server-only";

import { db } from "@/lib/drizzle/client";
import { resume, resumeTalk } from "@/lib/drizzle/scheam";
import { and, desc, eq, like, or } from "drizzle-orm";
import type { TalkListItemDTO } from "./talk.types";

export async function listTalksForUser(
  userId: string,
  keyword?: string,
): Promise<TalkListItemDTO[]> {
  const conditions = [eq(resume.userId, userId)];
  if (keyword) {
    const pattern = `%${keyword}%`;
    conditions.push(
      or(
        like(resumeTalk.title, pattern),
        like(resumeTalk.event, pattern),
        like(resumeTalk.description, pattern),
      )!,
    );
  }

  const rows = await db
    .select({
      id: resumeTalk.id,
      resumeId: resumeTalk.resumeId,
      resumeName: resume.name,
      title: resumeTalk.title,
      event: resumeTalk.event,
      date: resumeTalk.date,
      description: resumeTalk.description,
      links: resumeTalk.links,
      sortOrder: resumeTalk.sortOrder,
      createdAt: resumeTalk.createdAt,
      updatedAt: resumeTalk.updatedAt,
    })
    .from(resumeTalk)
    .innerJoin(resume, eq(resumeTalk.resumeId, resume.id))
    .where(and(...conditions))
    .orderBy(desc(resumeTalk.updatedAt));

  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function deleteTalkForUser(talkId: string, userId: string): Promise<void> {
  const row = await db
    .select({ id: resumeTalk.id })
    .from(resumeTalk)
    .innerJoin(resume, eq(resumeTalk.resumeId, resume.id))
    .where(and(eq(resumeTalk.id, talkId), eq(resume.userId, userId)))
    .limit(1);
  if (row.length === 0) throw new Error("Talk not found");
  await db.delete(resumeTalk).where(eq(resumeTalk.id, talkId));
}
