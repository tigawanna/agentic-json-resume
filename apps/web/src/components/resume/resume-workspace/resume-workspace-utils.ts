import { documentToInsertData } from "@/data-access-layer/resume/resume-converters";
import type { ResumeDetailDTO } from "@/data-access-layer/resume/resume.types";
import type { ResumeDocumentV1 } from "@/features/resume/resume-schema";

export const LOCAL_ANONYMOUS_USER_ID = "local:anonymous";

export function nowIso() {
  return new Date().toISOString();
}

export function resumeDocumentToDetail({
  id,
  userId,
  name,
  description,
  jobDescription,
  createdAt,
  doc,
}: {
  id: string;
  userId: string;
  name: string;
  description: string;
  jobDescription: string;
  createdAt: string;
  doc: ResumeDocumentV1;
}): ResumeDetailDTO {
  const data = documentToInsertData(id, doc);
  const updatedAt = nowIso();

  return {
    id,
    userId,
    name,
    fullName: data.resume.fullName,
    headline: data.resume.headline,
    description,
    jobDescription,
    templateId: data.resume.templateId,
    createdAt,
    updatedAt,
    sections: data.sections,
    contacts: data.contacts,
    links: data.links,
    summaries: data.summaries,
    experiences: data.experiences.map((experience) => ({
      ...experience,
      bullets: data.experienceBullets.filter((bullet) => bullet.experienceId === experience.id),
    })),
    education: data.education.map((education) => ({
      ...education,
      bullets: data.educationBullets.filter((bullet) => bullet.educationId === education.id),
    })),
    projects: data.projects,
    skillGroups: data.skillGroups.map((group) => ({
      ...group,
      skills: data.skills.filter((skill) => skill.groupId === group.id),
    })),
    talks: data.talks,
    certifications: [],
    volunteers: [],
    languages: [],
  };
}

export function createLocalResumeDetail(doc: ResumeDocumentV1): ResumeDetailDTO {
  const createdAt = nowIso();
  return {
    ...resumeDocumentToDetail({
      id: crypto.randomUUID(),
      userId: LOCAL_ANONYMOUS_USER_ID,
      name: "Local Resume",
      description: "Stored only in this browser",
      jobDescription: "",
      createdAt,
      doc,
    }),
    createdAt,
  };
}
