import type { AppDb } from "@/data-access-layer/event-sourced/collection";
import { emptyResumeItemOrder } from "@/data-access-layer/event-sourced/resume-item-order";
import type { ResumeDetailDTO } from "@/data-access-layer/resume/resume.types";
import { normalizeTitle } from "../find-existing";
import { joinSearchable, newId, nowMs } from "../row-helpers";

type SeedCtx = {
  db: AppDb;
  userId: string;
};

type Identified = { id: string };

type VirtualRowKeys = "$synced" | "$origin" | "$key" | "$collectionId";

function clearCollection(collection: {
  toArray: readonly Identified[];
  delete: (id: string) => void;
}) {
  for (const row of collection.toArray.slice()) {
    collection.delete(row.id);
  }
}

/** Drop local résumé shells and join rows so a re-import can rebuild associations. */
export function purgeLocalResumes(db: AppDb) {
  clearCollection(db.collections.resume);
  clearCollection(db.collections.resumeSection);
  clearCollection(db.collections.resumeContactItem);
  clearCollection(db.collections.resumeLinkItem);
  clearCollection(db.collections.resumeSummaryItem);
  clearCollection(db.collections.resumeNoteItem);
  clearCollection(db.collections.resumeExperienceItem);
  clearCollection(db.collections.resumeEducationItem);
  clearCollection(db.collections.resumeProjectItem);
  clearCollection(db.collections.resumeSkillGroupItem);
  clearCollection(db.collections.resumeTalkItem);
  clearCollection(db.collections.resumeCertificationItem);
  clearCollection(db.collections.resumeVolunteerItem);
  clearCollection(db.collections.resumeLanguageItem);
}

function resolveId<T extends Identified>(
  collection: { toArray: readonly T[]; insert: (row: T) => void },
  match: (row: T) => boolean,
  preferredId: string,
  build: (id: string) => Omit<T, VirtualRowKeys>,
): { id: string; created: boolean } {
  const byIdentity = collection.toArray.find(match);
  if (byIdentity) return { id: byIdentity.id, created: false };
  const byId = collection.toArray.find((row) => row.id === preferredId);
  if (byId) return { id: byId.id, created: false };
  collection.insert(build(preferredId) as T);
  return { id: preferredId, created: true };
}

function titleMatch(left: string, right: string) {
  return normalizeTitle(left) === normalizeTitle(right);
}

function junction<TExtra extends Record<string, string>>(
  resumeId: string,
  sortOrder: number,
  extra: TExtra,
) {
  const ts = nowMs();
  return {
    id: newId(),
    resumeId,
    sortOrder,
    createdAt: ts,
    updatedAt: ts,
    ...extra,
  };
}

function libraryMeta(userId: string, searchableText: string, sortOrder: number) {
  const ts = nowMs();
  return {
    userId,
    sortOrder,
    searchableText,
    embedding: null as number[] | null,
    embeddingModel: null as string | null,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function attachResumeDetail(ctx: SeedCtx, detail: ResumeDetailDTO) {
  const { db, userId } = ctx;
  const resumeId = detail.id;
  const ts = nowMs();

  for (const section of detail.sections) {
    db.collections.resumeSection.insert({
      id: section.id,
      resumeId,
      key: section.key,
      title: section.title,
      enabled: section.enabled,
      sortOrder: section.sortOrder,
      createdAt: ts,
      updatedAt: ts,
    });
  }

  const experienceOrder: string[] = [];
  for (const item of detail.experiences) {
    const title = `${item.role} @ ${item.company}`;
    const { id: experienceId, created } = resolveId(
      db.collections.resumeExperience,
      (row) => titleMatch(`${row.role} @ ${row.company}`, title),
      item.id,
      (id) => ({
        id,
        company: item.company,
        role: item.role,
        startDate: item.startDate,
        endDate: item.endDate,
        location: item.location,
        ...libraryMeta(
          userId,
          joinSearchable(item.role, item.company, item.location, item.startDate, item.endDate),
          item.sortOrder,
        ),
      }),
    );
    if (created) {
      for (const bullet of item.bullets ?? []) {
        db.collections.resumeExperienceBullet.insert({
          id: bullet.id,
          experienceId,
          text: bullet.text,
          sortOrder: bullet.sortOrder,
          searchableText: bullet.text,
          embedding: null,
          embeddingModel: null,
          createdAt: ts,
          updatedAt: ts,
        });
      }
    }
    db.collections.resumeExperienceItem.insert(
      junction(resumeId, item.sortOrder, { experienceId }),
    );
    experienceOrder.push(experienceId);
  }

  const educationOrder: string[] = [];
  for (const item of detail.education) {
    const title = `${item.school} ${item.degree}`;
    const { id: educationId, created } = resolveId(
      db.collections.resumeEducation,
      (row) => titleMatch(`${row.school} ${row.degree}`, title),
      item.id,
      (id) => ({
        id,
        school: item.school,
        degree: item.degree,
        field: item.field,
        startDate: item.startDate,
        endDate: item.endDate,
        description: item.description,
        ...libraryMeta(
          userId,
          joinSearchable(item.school, item.degree, item.field),
          item.sortOrder,
        ),
      }),
    );
    if (created) {
      for (const bullet of item.bullets ?? []) {
        db.collections.resumeEducationBullet.insert({
          id: bullet.id,
          educationId,
          text: bullet.text,
          sortOrder: bullet.sortOrder,
          searchableText: bullet.text,
          embedding: null,
          embeddingModel: null,
          createdAt: ts,
          updatedAt: ts,
        });
      }
    }
    db.collections.resumeEducationItem.insert(junction(resumeId, item.sortOrder, { educationId }));
    educationOrder.push(educationId);
  }

  const projectOrder: string[] = [];
  for (const item of detail.projects) {
    const { id: projectId } = resolveId(
      db.collections.resumeProject,
      (row) => titleMatch(row.name, item.name),
      item.id,
      (id) => ({
        id,
        name: item.name,
        url: item.url,
        homepageUrl: item.homepageUrl,
        description: item.description,
        tech: item.tech,
        ...libraryMeta(
          userId,
          joinSearchable(item.name, item.description, item.url),
          item.sortOrder,
        ),
      }),
    );
    db.collections.resumeProjectItem.insert(junction(resumeId, item.sortOrder, { projectId }));
    projectOrder.push(projectId);
  }

  const talkOrder: string[] = [];
  for (const item of detail.talks) {
    const { id: talkId } = resolveId(
      db.collections.resumeTalk,
      (row) => titleMatch(row.title, item.title),
      item.id,
      (id) => ({
        id,
        title: item.title,
        event: item.event,
        date: item.date,
        description: item.description,
        links: item.links || "[]",
        ...libraryMeta(
          userId,
          joinSearchable(item.title, item.event, item.date, item.description),
          item.sortOrder,
        ),
      }),
    );
    db.collections.resumeTalkItem.insert(junction(resumeId, item.sortOrder, { talkId }));
    talkOrder.push(talkId);
  }

  for (const item of detail.skillGroups) {
    const { id: groupId, created } = resolveId(
      db.collections.resumeSkillGroup,
      (row) => titleMatch(row.name, item.name),
      item.id,
      (id) => ({
        id,
        name: item.name,
        ...libraryMeta(
          userId,
          joinSearchable(item.name, ...item.skills.map((skill) => skill.name)),
          item.sortOrder,
        ),
      }),
    );
    if (created) {
      for (const skill of item.skills) {
        db.collections.resumeSkill.insert({
          id: skill.id,
          groupId,
          name: skill.name,
          level: skill.level,
          sortOrder: skill.sortOrder,
          searchableText: skill.name,
          embedding: null,
          embeddingModel: null,
          createdAt: ts,
          updatedAt: ts,
        });
      }
    }
    db.collections.resumeSkillGroupItem.insert(junction(resumeId, item.sortOrder, { groupId }));
  }

  for (const item of detail.contacts) {
    const title = `${item.type} ${item.value}`;
    const { id: contactId } = resolveId(
      db.collections.resumeContact,
      (row) => titleMatch(`${row.type} ${row.value}`, title),
      item.id,
      (id) => ({
        id,
        type: item.type,
        value: item.value,
        label: item.label,
        ...libraryMeta(userId, joinSearchable(item.type, item.value, item.label), item.sortOrder),
      }),
    );
    db.collections.resumeContactItem.insert(junction(resumeId, item.sortOrder, { contactId }));
  }

  for (const item of detail.links) {
    const { id: linkId } = resolveId(
      db.collections.resumeLink,
      (row) => titleMatch(row.url, item.url) || titleMatch(row.label, item.label),
      item.id,
      (id) => ({
        id,
        label: item.label,
        url: item.url,
        icon: item.icon,
        ...libraryMeta(userId, joinSearchable(item.label, item.url, item.icon), item.sortOrder),
      }),
    );
    db.collections.resumeLinkItem.insert(junction(resumeId, item.sortOrder, { linkId }));
  }

  for (const item of detail.summaries) {
    const { id: summaryId } = resolveId(
      db.collections.resumeSummary,
      (row) => titleMatch(row.text, item.text),
      item.id,
      (id) => ({
        id,
        text: item.text,
        ...libraryMeta(userId, joinSearchable(item.text), item.sortOrder),
      }),
    );
    db.collections.resumeSummaryItem.insert(junction(resumeId, item.sortOrder, { summaryId }));
  }

  for (const item of detail.notes) {
    const { id: noteId } = resolveId(
      db.collections.resumeNote,
      (row) => titleMatch(row.text, item.text),
      item.id,
      (id) => ({
        id,
        label: item.label,
        text: item.text,
        ...libraryMeta(userId, joinSearchable(item.label, item.text), item.sortOrder),
      }),
    );
    db.collections.resumeNoteItem.insert(junction(resumeId, item.sortOrder, { noteId }));
  }

  for (const item of detail.certifications) {
    const title = `${item.name} ${item.issuer}`;
    const { id: certificationId } = resolveId(
      db.collections.resumeCertification,
      (row) => titleMatch(`${row.name} ${row.issuer}`, title),
      item.id,
      (id) => ({
        id,
        name: item.name,
        issuer: item.issuer,
        date: item.date,
        url: item.url,
        ...libraryMeta(userId, joinSearchable(item.name, item.issuer, item.date), item.sortOrder),
      }),
    );
    db.collections.resumeCertificationItem.insert(
      junction(resumeId, item.sortOrder, { certificationId }),
    );
  }

  for (const item of detail.volunteers) {
    const title = `${item.role} @ ${item.organization}`;
    const { id: volunteerId } = resolveId(
      db.collections.resumeVolunteer,
      (row) => titleMatch(`${row.role} @ ${row.organization}`, title),
      item.id,
      (id) => ({
        id,
        organization: item.organization,
        role: item.role,
        startDate: item.startDate,
        endDate: item.endDate,
        description: item.description,
        ...libraryMeta(
          userId,
          joinSearchable(item.organization, item.role, item.description),
          item.sortOrder,
        ),
      }),
    );
    db.collections.resumeVolunteerItem.insert(junction(resumeId, item.sortOrder, { volunteerId }));
  }

  for (const item of detail.languages) {
    const { id: languageId } = resolveId(
      db.collections.resumeLanguage,
      (row) => titleMatch(row.name, item.name),
      item.id,
      (id) => ({
        id,
        name: item.name,
        proficiency: item.proficiency,
        ...libraryMeta(userId, joinSearchable(item.name, item.proficiency), item.sortOrder),
      }),
    );
    db.collections.resumeLanguageItem.insert(junction(resumeId, item.sortOrder, { languageId }));
  }

  db.collections.resume.update(resumeId, (draft) => {
    draft.experienceOrder = experienceOrder;
    draft.educationOrder = educationOrder;
    draft.projectOrder = projectOrder;
    draft.talkOrder = talkOrder;
    draft.updatedAt = nowMs();
  });
}

export function insertImportedResume(ctx: SeedCtx, detail: ResumeDetailDTO) {
  const tsCreated = Date.parse(detail.createdAt);
  const tsUpdated = Date.parse(detail.updatedAt);
  ctx.db.collections.resume.insert({
    id: detail.id,
    userId: ctx.userId,
    name: detail.name,
    fullName: detail.fullName,
    headline: detail.headline,
    description: detail.description,
    jobDescription: detail.jobDescription,
    templateId: detail.templateId || "default",
    ...emptyResumeItemOrder,
    searchableText: joinSearchable(
      detail.name,
      detail.fullName,
      detail.headline,
      detail.description,
    ),
    embedding: null,
    embeddingModel: null,
    createdAt: Number.isNaN(tsCreated) ? nowMs() : tsCreated,
    updatedAt: Number.isNaN(tsUpdated) ? nowMs() : tsUpdated,
  });
}
