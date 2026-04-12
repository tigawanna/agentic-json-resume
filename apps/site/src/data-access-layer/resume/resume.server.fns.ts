import "@tanstack/react-start/server-only";

import type { ResumeDocumentV1 } from "@/features/resume/resume-schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/drizzle/client";
import { resume } from "@/lib/drizzle/scheam/resume-schema";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { and, desc, eq } from "drizzle-orm";
import type { ResumeDTO } from "./resume.types";

async function requireUser() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error("Unauthorized");
  return session.user;
}

function toDTO(row: typeof resume.$inferSelect): ResumeDTO {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description,
    jobDescription: row.jobDescription,
    data: JSON.parse(row.data) as ResumeDocumentV1,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const listResumes = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(resume)
    .where(eq(resume.userId, user.id))
    .orderBy(desc(resume.updatedAt));
  return rows.map(toDTO);
});

export const getResume = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }): Promise<ResumeDTO | null> => {
    const user = await requireUser();
    const rows = await db
      .select()
      .from(resume)
      .where(and(eq(resume.id, data.id), eq(resume.userId, user.id)))
      .limit(1);
    const row = rows[0];
    return row ? toDTO(row) : null;
  });

export const createResume = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      name: string;
      description: string;
      jobDescription: string;
      data: ResumeDocumentV1;
    }) => input,
  )
  .handler(async ({ data: input }): Promise<ResumeDTO> => {
    const user = await requireUser();
    const id = crypto.randomUUID();
    const now = new Date();
    await db.insert(resume).values({
      id,
      userId: user.id,
      name: input.name,
      description: input.description,
      jobDescription: input.jobDescription,
      data: JSON.stringify(input.data),
      createdAt: now,
      updatedAt: now,
    });
    const rows = await db.select().from(resume).where(eq(resume.id, id)).limit(1);
    return toDTO(rows[0]!);
  });

export const updateResume = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      id: string;
      name?: string;
      description?: string;
      jobDescription?: string;
      data?: ResumeDocumentV1;
    }) => input,
  )
  .handler(async ({ data: input }): Promise<ResumeDTO> => {
    const user = await requireUser();
    const existing = await db
      .select()
      .from(resume)
      .where(and(eq(resume.id, input.id), eq(resume.userId, user.id)))
      .limit(1);
    if (!existing[0]) throw new Error("Resume not found");

    const updates: Record<string, string> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.jobDescription !== undefined) updates.jobDescription = input.jobDescription;
    if (input.data !== undefined) updates.data = JSON.stringify(input.data);

    await db
      .update(resume)
      .set(updates)
      .where(and(eq(resume.id, input.id), eq(resume.userId, user.id)));

    const rows = await db.select().from(resume).where(eq(resume.id, input.id)).limit(1);
    return toDTO(rows[0]!);
  });

export const deleteResume = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const user = await requireUser();
    await db.delete(resume).where(and(eq(resume.id, data.id), eq(resume.userId, user.id)));
    return { success: true };
  });
