import type { AppDb } from "@/data-access-layer/event-sourced/collection";
import { listCertifications } from "@/data-access-layer/resume/certifications/certification.functions";
import { listContacts } from "@/data-access-layer/resume/contacts/contact.functions";
import { listEducation } from "@/data-access-layer/resume/education/education.functions";
import { listExperiences } from "@/data-access-layer/resume/experiences/experience.functions";
import { listLanguages } from "@/data-access-layer/resume/languages/language.functions";
import { listLinks } from "@/data-access-layer/resume/links/link.functions";
import { listResumeProjects } from "@/data-access-layer/resume/resume-projects/resume-project.functions";
import { getResume, listResumes } from "@/data-access-layer/resume/resume.functions";
import { listSkillGroups } from "@/data-access-layer/resume/skill-groups/skill-group.functions";
import { listSummaries } from "@/data-access-layer/resume/summaries/summary.functions";
import { listTalks } from "@/data-access-layer/resume/talks/talk.functions";
import { listVolunteers } from "@/data-access-layer/resume/volunteers/volunteer.functions";
import { findExistingByExactTitle, normalizeTitle } from "../find-existing";
import { joinSearchable, newId } from "../row-helpers";
import {
  emptyStats,
  fetchAllCursorPages,
  isoToMs,
  logImportSummary,
  type ImportStats,
} from "./fetch-pages";

type SeedCtx = {
  db: AppDb;
  userId: string;
};

function timestamps(label: string, id: string, createdAt: string, updatedAt: string) {
  return {
    createdAt: isoToMs(label, createdAt, id),
    updatedAt: isoToMs(label, updatedAt, id),
  };
}

function skipIfDuplicateTitle<T>(
  label: string,
  stats: ImportStats,
  collection: { toArray: readonly T[] },
  incomingTitle: string,
  getExistingTitle: (row: T) => string,
  extra: Record<string, unknown>,
  seenIncoming: Set<string>,
): boolean {
  const key = normalizeTitle(incomingTitle);
  if (!key) {
    console.warn(`[import ${label}] skip empty title`, extra);
    stats.skipped += 1;
    return true;
  }
  if (seenIncoming.has(key)) {
    console.warn(`[import ${label}] skip duplicate title in API payload`, extra);
    stats.skipped += 1;
    return true;
  }
  const existing = findExistingByExactTitle(collection, incomingTitle, getExistingTitle);
  if (existing) {
    console.warn(`[import ${label}] skip duplicate title already in library`, extra);
    stats.skipped += 1;
    return true;
  }
  seenIncoming.add(key);
  return false;
}

export async function importTalksFromLegacy(ctx: SeedCtx): Promise<ImportStats> {
  const label = "talks";
  const items = await fetchAllCursorPages(label, (cursor) =>
    listTalks({ data: { cursor, direction: "after" } }),
  );
  const stats = emptyStats(items.length);
  const seen = new Set<string>();
  const col = ctx.db.collections.resumeTalk;

  for (const item of items) {
    if (
      skipIfDuplicateTitle(
        label,
        stats,
        col,
        item.title,
        (row) => row.title,
        { id: item.id, title: item.title },
        seen,
      )
    ) {
      continue;
    }
    try {
      col.insert({
        id: item.id,
        userId: ctx.userId,
        title: item.title,
        event: item.event,
        date: item.date,
        description: item.description,
        links: item.links || "[]",
        sortOrder: item.sortOrder,
        searchableText: joinSearchable(item.title, item.event, item.date, item.description),
        embedding: null,
        embeddingModel: null,
        ...timestamps(label, item.id, item.createdAt, item.updatedAt),
      });
      stats.inserted += 1;
    } catch (err: unknown) {
      stats.failed += 1;
      console.error(`[import ${label}] insert failed`, { id: item.id, title: item.title }, err);
    }
  }

  logImportSummary(label, stats);
  return stats;
}

export async function importLinksFromLegacy(ctx: SeedCtx): Promise<ImportStats> {
  const label = "links";
  const items = await fetchAllCursorPages(label, (cursor) =>
    listLinks({ data: { cursor, direction: "after" } }),
  );
  const stats = emptyStats(items.length);
  const seen = new Set<string>();
  const col = ctx.db.collections.resumeLink;

  for (const item of items) {
    if (
      skipIfDuplicateTitle(
        label,
        stats,
        col,
        item.label,
        (row) => row.label,
        { id: item.id, label: item.label },
        seen,
      )
    ) {
      continue;
    }
    try {
      col.insert({
        id: item.id,
        userId: ctx.userId,
        label: item.label,
        url: item.url,
        icon: item.icon,
        sortOrder: item.sortOrder,
        searchableText: joinSearchable(item.label, item.url, item.icon),
        embedding: null,
        embeddingModel: null,
        ...timestamps(label, item.id, item.createdAt, item.updatedAt),
      });
      stats.inserted += 1;
    } catch (err: unknown) {
      stats.failed += 1;
      console.error(`[import ${label}] insert failed`, { id: item.id, label: item.label }, err);
    }
  }

  logImportSummary(label, stats);
  return stats;
}

export async function importProjectsFromLegacy(ctx: SeedCtx): Promise<ImportStats> {
  const label = "projects";
  const items = await fetchAllCursorPages(label, (cursor) =>
    listResumeProjects({ data: { cursor, direction: "after" } }),
  );
  const stats = emptyStats(items.length);
  const seen = new Set<string>();
  const col = ctx.db.collections.resumeProject;

  for (const item of items) {
    if (
      skipIfDuplicateTitle(
        label,
        stats,
        col,
        item.name,
        (row) => row.name,
        { id: item.id, name: item.name },
        seen,
      )
    ) {
      continue;
    }
    try {
      col.insert({
        id: item.id,
        userId: ctx.userId,
        name: item.name,
        url: item.url,
        homepageUrl: item.homepageUrl,
        description: item.description,
        tech: item.tech,
        sortOrder: item.sortOrder,
        searchableText: joinSearchable(
          item.name,
          item.url,
          item.homepageUrl,
          item.description,
          item.tech,
        ),
        embedding: null,
        embeddingModel: null,
        ...timestamps(label, item.id, item.createdAt, item.updatedAt),
      });
      stats.inserted += 1;
    } catch (err: unknown) {
      stats.failed += 1;
      console.error(`[import ${label}] insert failed`, { id: item.id, name: item.name }, err);
    }
  }

  logImportSummary(label, stats);
  return stats;
}

export async function importCertificationsFromLegacy(ctx: SeedCtx): Promise<ImportStats> {
  const label = "certifications";
  const items = await fetchAllCursorPages(label, (cursor) =>
    listCertifications({ data: { cursor, direction: "after" } }),
  );
  const stats = emptyStats(items.length);
  const seen = new Set<string>();
  const col = ctx.db.collections.resumeCertification;

  for (const item of items) {
    if (
      skipIfDuplicateTitle(
        label,
        stats,
        col,
        item.name,
        (row) => row.name,
        { id: item.id, name: item.name },
        seen,
      )
    ) {
      continue;
    }
    try {
      col.insert({
        id: item.id,
        userId: ctx.userId,
        name: item.name,
        issuer: item.issuer,
        date: item.date,
        url: item.url,
        sortOrder: item.sortOrder,
        searchableText: joinSearchable(item.name, item.issuer, item.date, item.url),
        embedding: null,
        embeddingModel: null,
        ...timestamps(label, item.id, item.createdAt, item.updatedAt),
      });
      stats.inserted += 1;
    } catch (err: unknown) {
      stats.failed += 1;
      console.error(`[import ${label}] insert failed`, { id: item.id, name: item.name }, err);
    }
  }

  logImportSummary(label, stats);
  return stats;
}

export async function importLanguagesFromLegacy(ctx: SeedCtx): Promise<ImportStats> {
  const label = "languages";
  const items = await fetchAllCursorPages(label, (cursor) =>
    listLanguages({ data: { cursor, direction: "after" } }),
  );
  const stats = emptyStats(items.length);
  const seen = new Set<string>();
  const col = ctx.db.collections.resumeLanguage;

  for (const item of items) {
    if (
      skipIfDuplicateTitle(
        label,
        stats,
        col,
        item.name,
        (row) => row.name,
        { id: item.id, name: item.name },
        seen,
      )
    ) {
      continue;
    }
    try {
      col.insert({
        id: item.id,
        userId: ctx.userId,
        name: item.name,
        proficiency: item.proficiency,
        sortOrder: item.sortOrder,
        searchableText: joinSearchable(item.name, item.proficiency),
        embedding: null,
        embeddingModel: null,
        ...timestamps(label, item.id, item.createdAt, item.updatedAt),
      });
      stats.inserted += 1;
    } catch (err: unknown) {
      stats.failed += 1;
      console.error(`[import ${label}] insert failed`, { id: item.id, name: item.name }, err);
    }
  }

  logImportSummary(label, stats);
  return stats;
}

export async function importSkillGroupsFromLegacy(ctx: SeedCtx): Promise<ImportStats> {
  const label = "skill-groups";
  const items = await fetchAllCursorPages(label, (cursor) =>
    listSkillGroups({ data: { cursor, direction: "after" } }),
  );
  const stats = emptyStats(items.length);
  const seen = new Set<string>();
  const col = ctx.db.collections.resumeSkillGroup;

  for (const item of items) {
    if (
      skipIfDuplicateTitle(
        label,
        stats,
        col,
        item.name,
        (row) => row.name,
        { id: item.id, name: item.name },
        seen,
      )
    ) {
      continue;
    }
    let skillNames: string[] = [];
    try {
      const parsed: unknown = JSON.parse(item.skills);
      if (!Array.isArray(parsed)) {
        console.error(`[import ${label}] skills is not an array`, {
          id: item.id,
          skills: item.skills,
        });
      } else {
        skillNames = parsed.filter((s): s is string => typeof s === "string");
      }
    } catch (err: unknown) {
      console.error(
        `[import ${label}] skills JSON parse failed`,
        { id: item.id, skills: item.skills },
        err,
      );
    }

    try {
      col.insert({
        id: item.id,
        userId: ctx.userId,
        name: item.name,
        sortOrder: item.sortOrder,
        searchableText: joinSearchable(item.name, ...skillNames),
        embedding: null,
        embeddingModel: null,
        ...timestamps(label, item.id, item.createdAt, item.updatedAt),
      });
      skillNames.forEach((name, index) => {
        ctx.db.collections.resumeSkill.insert({
          id: newId(),
          groupId: item.id,
          name,
          level: null,
          sortOrder: index,
          searchableText: name,
          embedding: null,
          embeddingModel: null,
          ...timestamps(label, item.id, item.createdAt, item.updatedAt),
        });
      });
      stats.inserted += 1;
    } catch (err: unknown) {
      stats.failed += 1;
      console.error(`[import ${label}] insert failed`, { id: item.id, name: item.name }, err);
    }
  }

  logImportSummary(label, stats);
  return stats;
}

export async function importExperiencesFromLegacy(ctx: SeedCtx): Promise<ImportStats> {
  const label = "experiences";
  const items = await fetchAllCursorPages(label, (cursor) =>
    listExperiences({ data: { cursor, direction: "after" } }),
  );
  const stats = emptyStats(items.length);
  const seen = new Set<string>();
  const col = ctx.db.collections.resumeExperience;

  for (const item of items) {
    const title = `${item.role} @ ${item.company}`;
    if (
      skipIfDuplicateTitle(
        label,
        stats,
        col,
        title,
        (row) => `${row.role} @ ${row.company}`,
        { id: item.id, title },
        seen,
      )
    ) {
      continue;
    }
    try {
      col.insert({
        id: item.id,
        userId: ctx.userId,
        company: item.company,
        role: item.role,
        startDate: item.startDate,
        endDate: item.endDate,
        location: item.location,
        sortOrder: item.sortOrder,
        searchableText: joinSearchable(
          item.role,
          item.company,
          item.location,
          item.startDate,
          item.endDate,
        ),
        embedding: null,
        embeddingModel: null,
        ...timestamps(label, item.id, item.createdAt, item.updatedAt),
      });
      for (const bullet of item.bullets) {
        ctx.db.collections.resumeExperienceBullet.insert({
          id: bullet.id,
          experienceId: item.id,
          text: bullet.text,
          sortOrder: bullet.sortOrder,
          searchableText: bullet.text,
          embedding: null,
          embeddingModel: null,
          ...timestamps(label, bullet.id, item.createdAt, item.updatedAt),
        });
      }
      stats.inserted += 1;
    } catch (err: unknown) {
      stats.failed += 1;
      console.error(`[import ${label}] insert failed`, { id: item.id, title }, err);
    }
  }

  logImportSummary(label, stats);
  return stats;
}

export async function importEducationFromLegacy(ctx: SeedCtx): Promise<ImportStats> {
  const label = "education";
  const items = await fetchAllCursorPages(label, (cursor) =>
    listEducation({ data: { cursor, direction: "after" } }),
  );
  const stats = emptyStats(items.length);
  const seen = new Set<string>();
  const col = ctx.db.collections.resumeEducation;

  for (const item of items) {
    const title = `${item.school} ${item.degree}`;
    if (
      skipIfDuplicateTitle(
        label,
        stats,
        col,
        title,
        (row) => `${row.school} ${row.degree}`,
        { id: item.id, title },
        seen,
      )
    ) {
      continue;
    }
    try {
      col.insert({
        id: item.id,
        userId: ctx.userId,
        school: item.school,
        degree: item.degree,
        field: item.field,
        startDate: item.startDate,
        endDate: item.endDate,
        description: item.description,
        sortOrder: item.sortOrder,
        searchableText: joinSearchable(
          item.school,
          item.degree,
          item.field,
          item.startDate,
          item.endDate,
          item.description,
        ),
        embedding: null,
        embeddingModel: null,
        ...timestamps(label, item.id, item.createdAt, item.updatedAt),
      });
      stats.inserted += 1;
    } catch (err: unknown) {
      stats.failed += 1;
      console.error(`[import ${label}] insert failed`, { id: item.id, title }, err);
    }
  }

  logImportSummary(label, stats);
  return stats;
}

export async function importVolunteersFromLegacy(ctx: SeedCtx): Promise<ImportStats> {
  const label = "volunteers";
  const items = await fetchAllCursorPages(label, (cursor) =>
    listVolunteers({ data: { cursor, direction: "after" } }),
  );
  const stats = emptyStats(items.length);
  const seen = new Set<string>();
  const col = ctx.db.collections.resumeVolunteer;

  for (const item of items) {
    const title = `${item.organization} ${item.role}`;
    if (
      skipIfDuplicateTitle(
        label,
        stats,
        col,
        title,
        (row) => `${row.organization} ${row.role}`,
        { id: item.id, title },
        seen,
      )
    ) {
      continue;
    }
    try {
      col.insert({
        id: item.id,
        userId: ctx.userId,
        organization: item.organization,
        role: item.role,
        startDate: item.startDate,
        endDate: item.endDate,
        description: item.description,
        sortOrder: item.sortOrder,
        searchableText: joinSearchable(
          item.organization,
          item.role,
          item.startDate,
          item.endDate,
          item.description,
        ),
        embedding: null,
        embeddingModel: null,
        ...timestamps(label, item.id, item.createdAt, item.updatedAt),
      });
      stats.inserted += 1;
    } catch (err: unknown) {
      stats.failed += 1;
      console.error(`[import ${label}] insert failed`, { id: item.id, title }, err);
    }
  }

  logImportSummary(label, stats);
  return stats;
}

export async function importContactsFromLegacy(ctx: SeedCtx): Promise<ImportStats> {
  const label = "contacts";
  const items = await fetchAllCursorPages(label, (cursor) =>
    listContacts({ data: { cursor, direction: "after" } }),
  );
  const stats = emptyStats(items.length);
  const seen = new Set<string>();
  const col = ctx.db.collections.resumeContact;

  for (const item of items) {
    const title = `${item.type} ${item.value}`;
    if (
      skipIfDuplicateTitle(
        label,
        stats,
        col,
        title,
        (row) => `${row.type} ${row.value}`,
        { id: item.id, title },
        seen,
      )
    ) {
      continue;
    }
    try {
      col.insert({
        id: item.id,
        userId: ctx.userId,
        type: item.type,
        value: item.value,
        label: item.label,
        sortOrder: item.sortOrder,
        searchableText: joinSearchable(item.type, item.value, item.label),
        embedding: null,
        embeddingModel: null,
        ...timestamps(label, item.id, item.createdAt, item.updatedAt),
      });
      stats.inserted += 1;
    } catch (err: unknown) {
      stats.failed += 1;
      console.error(`[import ${label}] insert failed`, { id: item.id, title }, err);
    }
  }

  logImportSummary(label, stats);
  return stats;
}

export async function importSummariesFromLegacy(ctx: SeedCtx): Promise<ImportStats> {
  const label = "summaries";
  const items = await fetchAllCursorPages(label, (cursor) =>
    listSummaries({ data: { cursor, direction: "after" } }),
  );
  const stats = emptyStats(items.length);
  const seen = new Set<string>();
  const col = ctx.db.collections.resumeSummary;

  for (const item of items) {
    if (
      skipIfDuplicateTitle(label, stats, col, item.text, (row) => row.text, { id: item.id }, seen)
    ) {
      continue;
    }
    try {
      col.insert({
        id: item.id,
        userId: ctx.userId,
        text: item.text,
        sortOrder: item.sortOrder,
        searchableText: joinSearchable(item.text),
        embedding: null,
        embeddingModel: null,
        ...timestamps(label, item.id, item.createdAt, item.updatedAt),
      });
      stats.inserted += 1;
    } catch (err: unknown) {
      stats.failed += 1;
      console.error(`[import ${label}] insert failed`, { id: item.id }, err);
    }
  }

  logImportSummary(label, stats);
  return stats;
}

export async function importResumesFromLegacy(ctx: SeedCtx): Promise<ImportStats> {
  const label = "resumes";
  let items;
  try {
    items = await listResumes();
  } catch (err: unknown) {
    console.error(`[import ${label}] listResumes failed`, err);
    throw err;
  }
  const stats = emptyStats(items.length);
  const seen = new Set<string>();
  const col = ctx.db.collections.resume;

  for (const item of items) {
    if (
      skipIfDuplicateTitle(
        label,
        stats,
        col,
        item.name,
        (row) => row.name,
        { id: item.id, name: item.name },
        seen,
      )
    ) {
      continue;
    }
    try {
      col.insert({
        id: item.id,
        userId: ctx.userId,
        name: item.name,
        fullName: item.fullName,
        headline: item.headline,
        description: item.description,
        jobDescription: "",
        templateId: item.templateId || "default",
        searchableText: joinSearchable(item.name, item.fullName, item.headline, item.description),
        embedding: null,
        embeddingModel: null,
        ...timestamps(label, item.id, item.createdAt, item.updatedAt),
      });
      stats.inserted += 1;
    } catch (err: unknown) {
      stats.failed += 1;
      console.error(`[import ${label}] insert failed`, { id: item.id, name: item.name }, err);
    }
  }

  logImportSummary(label, stats);
  return stats;
}

export async function importNotesFromLegacy(ctx: SeedCtx): Promise<ImportStats> {
  const label = "notes";
  let resumes;
  try {
    resumes = await listResumes();
  } catch (err: unknown) {
    console.error(`[import ${label}] listResumes failed`, err);
    throw err;
  }

  const stats = emptyStats(0);
  const seen = new Set<string>();
  const col = ctx.db.collections.resumeNote;

  for (const resume of resumes) {
    let detail;
    try {
      detail = await getResume({ data: { id: resume.id } });
    } catch (err: unknown) {
      stats.failed += 1;
      console.error(`[import ${label}] getResume failed`, { resumeId: resume.id }, err);
      continue;
    }
    if (!detail) {
      console.warn(`[import ${label}] getResume returned empty`, { resumeId: resume.id });
      continue;
    }
    stats.fetched += detail.notes.length;
    for (const item of detail.notes) {
      if (
        skipIfDuplicateTitle(
          label,
          stats,
          col,
          item.text,
          (row) => row.text,
          { id: item.id, resumeId: resume.id },
          seen,
        )
      ) {
        continue;
      }
      try {
        col.insert({
          id: item.id,
          userId: ctx.userId,
          label: item.label,
          text: item.text,
          sortOrder: item.sortOrder,
          searchableText: joinSearchable(item.label, item.text),
          embedding: null,
          embeddingModel: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        stats.inserted += 1;
      } catch (err: unknown) {
        stats.failed += 1;
        console.error(`[import ${label}] insert failed`, { id: item.id, resumeId: resume.id }, err);
      }
    }
  }

  logImportSummary(label, stats);
  return stats;
}

export const legacyImporters = {
  talks: { run: importTalksFromLegacy, noun: "talks" },
  links: { run: importLinksFromLegacy, noun: "links" },
  projects: { run: importProjectsFromLegacy, noun: "projects" },
  certifications: { run: importCertificationsFromLegacy, noun: "certifications" },
  languages: { run: importLanguagesFromLegacy, noun: "languages" },
  "skill-groups": { run: importSkillGroupsFromLegacy, noun: "skill groups" },
  experiences: { run: importExperiencesFromLegacy, noun: "experiences" },
  education: { run: importEducationFromLegacy, noun: "education rows" },
  volunteers: { run: importVolunteersFromLegacy, noun: "volunteer roles" },
  contacts: { run: importContactsFromLegacy, noun: "contacts" },
  summaries: { run: importSummariesFromLegacy, noun: "summaries" },
  resumes: { run: importResumesFromLegacy, noun: "résumés" },
  notes: { run: importNotesFromLegacy, noun: "notes" },
} as const;

export type LegacyImporterKey = keyof typeof legacyImporters;
