import "@tanstack/react-start/server-only";

import { db } from "@/lib/drizzle/client";
import { resume, resumeSkill, resumeSkillGroup } from "@/lib/drizzle/scheam";
import { and, asc, desc, eq, like, or } from "drizzle-orm";
import type { SkillGroupListItemDTO } from "./skill-group.types";

export async function listSkillGroupsForUser(
  userId: string,
  keyword?: string,
): Promise<SkillGroupListItemDTO[]> {
  const conditions = [eq(resume.userId, userId)];
  if (keyword) {
    const pattern = `%${keyword}%`;
    conditions.push(or(like(resumeSkillGroup.name, pattern))!);
  }

  const groups = await db
    .select({
      id: resumeSkillGroup.id,
      resumeId: resumeSkillGroup.resumeId,
      resumeName: resume.name,
      name: resumeSkillGroup.name,
      sortOrder: resumeSkillGroup.sortOrder,
      createdAt: resumeSkillGroup.createdAt,
      updatedAt: resumeSkillGroup.updatedAt,
    })
    .from(resumeSkillGroup)
    .innerJoin(resume, eq(resumeSkillGroup.resumeId, resume.id))
    .where(and(...conditions))
    .orderBy(desc(resumeSkillGroup.updatedAt));

  const result: SkillGroupListItemDTO[] = [];
  for (const g of groups) {
    const skills = await db
      .select({ name: resumeSkill.name })
      .from(resumeSkill)
      .where(eq(resumeSkill.groupId, g.id))
      .orderBy(asc(resumeSkill.sortOrder));
    result.push({
      ...g,
      skills: JSON.stringify(skills.map((s) => s.name)),
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
    });
  }
  return result;
}

export async function deleteSkillGroupForUser(groupId: string, userId: string): Promise<void> {
  const row = await db
    .select({ id: resumeSkillGroup.id })
    .from(resumeSkillGroup)
    .innerJoin(resume, eq(resumeSkillGroup.resumeId, resume.id))
    .where(and(eq(resumeSkillGroup.id, groupId), eq(resume.userId, userId)))
    .limit(1);
  if (row.length === 0) throw new Error("Skill group not found");
  await db.delete(resumeSkillGroup).where(eq(resumeSkillGroup.id, groupId));
}
