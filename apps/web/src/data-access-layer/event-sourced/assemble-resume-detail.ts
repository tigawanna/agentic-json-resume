import { SECTION_KEYS, TEMPLATE_IDS, type TemplateId } from "@/features/resume/resume-schema";
import type { ResumeDetailDTO } from "@/data-access-layer/resume/resume.types";
import type {
  Resume,
  ResumeCertification,
  ResumeCertificationItem,
  ResumeContact,
  ResumeContactItem,
  ResumeEducation,
  ResumeEducationBullet,
  ResumeEducationItem,
  ResumeExperience,
  ResumeExperienceBullet,
  ResumeExperienceItem,
  ResumeLanguage,
  ResumeLanguageItem,
  ResumeLink,
  ResumeLinkItem,
  ResumeNote,
  ResumeNoteItem,
  ResumeProject,
  ResumeProjectItem,
  ResumeSection,
  ResumeSkill,
  ResumeSkillGroup,
  ResumeSkillGroupItem,
  ResumeSummary,
  ResumeSummaryItem,
  ResumeTalk,
  ResumeTalkItem,
  ResumeVolunteer,
  ResumeVolunteerItem,
} from "./schemas";

export type EventSourcedResumeSnapshots = {
  resume: Resume | undefined;
  sections: ResumeSection[];
  contacts: ResumeContact[];
  contactItems: ResumeContactItem[];
  links: ResumeLink[];
  linkItems: ResumeLinkItem[];
  summaries: ResumeSummary[];
  summaryItems: ResumeSummaryItem[];
  notes: ResumeNote[];
  noteItems: ResumeNoteItem[];
  experiences: ResumeExperience[];
  experienceItems: ResumeExperienceItem[];
  experienceBullets: ResumeExperienceBullet[];
  education: ResumeEducation[];
  educationItems: ResumeEducationItem[];
  educationBullets: ResumeEducationBullet[];
  projects: ResumeProject[];
  projectItems: ResumeProjectItem[];
  skillGroups: ResumeSkillGroup[];
  skillGroupItems: ResumeSkillGroupItem[];
  skills: ResumeSkill[];
  talks: ResumeTalk[];
  talkItems: ResumeTalkItem[];
  certifications: ResumeCertification[];
  certificationItems: ResumeCertificationItem[];
  volunteers: ResumeVolunteer[];
  volunteerItems: ResumeVolunteerItem[];
  languages: ResumeLanguage[];
  languageItems: ResumeLanguageItem[];
};

export function asTemplateId(value: string): TemplateId {
  return TEMPLATE_IDS.includes(value as TemplateId) ? (value as TemplateId) : "classic";
}

function iso(ms: number) {
  return new Date(ms).toISOString();
}

function byId<T extends { id: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function joinSorted<TItem extends { resumeId: string; sortOrder: number }, TRow>(
  resumeId: string,
  items: TItem[],
  rowsById: Map<string, TRow>,
  entityId: (item: TItem) => string,
) {
  return items
    .filter((item) => item.resumeId === resumeId)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((item) => {
      const row = rowsById.get(entityId(item));
      if (!row) return [];
      return [{ item, row }];
    });
}

export function assembleResumeDetail(
  resumeId: string,
  snapshots: EventSourcedResumeSnapshots,
): ResumeDetailDTO | null {
  const resume = snapshots.resume;
  if (!resume || resume.id !== resumeId) return null;

  const sectionRows = snapshots.sections
    .filter((section) => section.resumeId === resumeId)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const sections =
    sectionRows.length > 0
      ? sectionRows.map((section) => ({
          id: section.id,
          resumeId: section.resumeId,
          key: section.key,
          title: section.title,
          enabled: section.enabled,
          sortOrder: section.sortOrder,
        }))
      : SECTION_KEYS.map((key, sortOrder) => ({
          id: `${resumeId}:${key}`,
          resumeId,
          key,
          title: key === "header" ? "Profile" : key.charAt(0).toUpperCase() + key.slice(1),
          enabled: true,
          sortOrder,
        }));

  const contacts = joinSorted(
    resumeId,
    snapshots.contactItems,
    byId(snapshots.contacts),
    (item) => item.contactId,
  ).map(({ item, row }) => ({
    id: row.id,
    resumeId,
    type: row.type,
    value: row.value,
    label: row.label,
    sortOrder: item.sortOrder,
  }));

  const links = joinSorted(
    resumeId,
    snapshots.linkItems,
    byId(snapshots.links),
    (item) => item.linkId,
  ).map(({ item, row }) => ({
    id: row.id,
    resumeId,
    label: row.label,
    url: row.url,
    icon: row.icon ?? null,
    sortOrder: item.sortOrder,
  }));

  const summaries = joinSorted(
    resumeId,
    snapshots.summaryItems,
    byId(snapshots.summaries),
    (item) => item.summaryId,
  ).map(({ item, row }) => ({
    id: row.id,
    resumeId,
    text: row.text,
    sortOrder: item.sortOrder,
  }));

  const notes = joinSorted(
    resumeId,
    snapshots.noteItems,
    byId(snapshots.notes),
    (item) => item.noteId,
  ).map(({ item, row }) => ({
    id: row.id,
    resumeId,
    label: row.label,
    text: row.text,
    sortOrder: item.sortOrder,
  }));

  const experiences = joinSorted(
    resumeId,
    snapshots.experienceItems,
    byId(snapshots.experiences),
    (item) => item.experienceId,
  ).map(({ item, row }) => ({
    id: row.id,
    resumeId,
    company: row.company,
    role: row.role,
    startDate: row.startDate,
    endDate: row.endDate,
    location: row.location,
    sortOrder: item.sortOrder,
    bullets: snapshots.experienceBullets
      .filter((bullet) => bullet.experienceId === row.id)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((bullet) => ({
        id: bullet.id,
        experienceId: bullet.experienceId,
        text: bullet.text,
        sortOrder: bullet.sortOrder,
      })),
  }));

  const education = joinSorted(
    resumeId,
    snapshots.educationItems,
    byId(snapshots.education),
    (item) => item.educationId,
  ).map(({ item, row }) => ({
    id: row.id,
    resumeId,
    school: row.school,
    degree: row.degree,
    field: row.field,
    startDate: row.startDate,
    endDate: row.endDate,
    description: row.description,
    sortOrder: item.sortOrder,
    bullets: snapshots.educationBullets
      .filter((bullet) => bullet.educationId === row.id)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((bullet) => ({
        id: bullet.id,
        educationId: bullet.educationId,
        text: bullet.text,
        sortOrder: bullet.sortOrder,
      })),
  }));

  const projects = joinSorted(
    resumeId,
    snapshots.projectItems,
    byId(snapshots.projects),
    (item) => item.projectId,
  ).map(({ item, row }) => ({
    id: row.id,
    resumeId,
    name: row.name,
    url: row.url,
    homepageUrl: row.homepageUrl,
    description: row.description,
    tech: row.tech,
    sortOrder: item.sortOrder,
  }));

  const skillGroups = joinSorted(
    resumeId,
    snapshots.skillGroupItems,
    byId(snapshots.skillGroups),
    (item) => item.groupId,
  ).map(({ item, row }) => ({
    id: row.id,
    resumeId,
    name: row.name,
    sortOrder: item.sortOrder,
    skills: snapshots.skills
      .filter((skill) => skill.groupId === row.id)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((skill) => ({
        id: skill.id,
        groupId: skill.groupId,
        name: skill.name,
        level: skill.level ?? null,
        sortOrder: skill.sortOrder,
      })),
  }));

  const talks = joinSorted(
    resumeId,
    snapshots.talkItems,
    byId(snapshots.talks),
    (item) => item.talkId,
  ).map(({ item, row }) => ({
    id: row.id,
    resumeId,
    title: row.title,
    event: row.event,
    date: row.date,
    description: row.description,
    links: row.links,
    sortOrder: item.sortOrder,
  }));

  const certifications = joinSorted(
    resumeId,
    snapshots.certificationItems,
    byId(snapshots.certifications),
    (item) => item.certificationId,
  ).map(({ item, row }) => ({
    id: row.id,
    resumeId,
    name: row.name,
    issuer: row.issuer,
    date: row.date,
    url: row.url,
    sortOrder: item.sortOrder,
  }));

  const volunteers = joinSorted(
    resumeId,
    snapshots.volunteerItems,
    byId(snapshots.volunteers),
    (item) => item.volunteerId,
  ).map(({ item, row }) => ({
    id: row.id,
    resumeId,
    organization: row.organization,
    role: row.role,
    startDate: row.startDate,
    endDate: row.endDate,
    description: row.description,
    sortOrder: item.sortOrder,
  }));

  const languages = joinSorted(
    resumeId,
    snapshots.languageItems,
    byId(snapshots.languages),
    (item) => item.languageId,
  ).map(({ item, row }) => ({
    id: row.id,
    resumeId,
    name: row.name,
    proficiency: row.proficiency,
    sortOrder: item.sortOrder,
  }));

  return {
    id: resume.id,
    userId: resume.userId,
    name: resume.name,
    fullName: resume.fullName,
    headline: resume.headline,
    description: resume.description,
    jobDescription: resume.jobDescription,
    templateId: asTemplateId(resume.templateId),
    createdAt: iso(resume.createdAt),
    updatedAt: iso(resume.updatedAt),
    sections,
    contacts,
    links,
    summaries,
    notes,
    experiences,
    education,
    projects,
    skillGroups,
    talks,
    certifications,
    volunteers,
    languages,
  };
}
