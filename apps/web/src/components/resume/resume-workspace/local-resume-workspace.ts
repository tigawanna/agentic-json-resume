import type { ResumeDetailDTO } from "@/data-access-layer/resume/resume.types";
import type {
  ContactDraft,
  EducationDraft,
  ExperienceDraft,
  LinkDraft,
  ProjectDraft,
  ResumeMetadataDraft,
  ResumeWorkspaceAdapter,
  SkillGroupDraft,
  TalkDraft,
} from "./resume-workspace-types";
import { persistLocalResume } from "./local-resume-collection";
import { resumeDocumentToDetail, nowIso } from "./resume-workspace-utils";
import type { ResumeDocumentV1 } from "@/features/resume/resume-schema";

async function save(next: ResumeDetailDTO) {
  await persistLocalResume({ ...next, updatedAt: nowIso() });
}

function makeId() {
  return crypto.randomUUID();
}

export function createLocalResumeWorkspace(resume: ResumeDetailDTO): ResumeWorkspaceAdapter {
  return {
    mode: "local",
    resume,
    async updateMetadata(values: ResumeMetadataDraft) {
      await save({ ...resume, ...values });
    },
    async updateContacts(contacts: ContactDraft[]) {
      await save({
        ...resume,
        contacts: contacts.map((contact, index) => ({
          id: makeId(),
          resumeId: resume.id,
          type: contact.type,
          value: contact.value,
          label: contact.label,
          sortOrder: index,
        })),
      });
    },
    async updateLinks(links: LinkDraft[]) {
      await save({
        ...resume,
        links: links.map((link, index) => ({
          id: makeId(),
          resumeId: resume.id,
          label: link.label,
          url: link.url,
          icon: link.icon ?? null,
          sortOrder: index,
        })),
      });
    },
    async updateSummary(text: string) {
      await save({
        ...resume,
        summaries: text.trim() ? [{ id: makeId(), resumeId: resume.id, text, sortOrder: 0 }] : [],
      });
    },
    async updateSkillGroups(groups: SkillGroupDraft[]) {
      await save({
        ...resume,
        skillGroups: groups.map((group, groupIndex) => {
          const groupId = makeId();
          return {
            id: groupId,
            resumeId: resume.id,
            name: group.name,
            sortOrder: groupIndex,
            skills: group.items.map((skill, skillIndex) => ({
              id: makeId(),
              groupId,
              name: skill,
              level: null,
              sortOrder: skillIndex,
            })),
          };
        }),
      });
    },
    async createExperience(values: ExperienceDraft) {
      const id = makeId();
      await save({
        ...resume,
        experiences: [
          ...resume.experiences,
          { id, resumeId: resume.id, ...values, sortOrder: resume.experiences.length, bullets: [] },
        ],
      });
      return { id };
    },
    async updateExperience(id: string, values: ExperienceDraft) {
      await save({
        ...resume,
        experiences: resume.experiences.map((item) =>
          item.id === id ? { ...item, ...values } : item,
        ),
      });
    },
    async deleteExperience(id: string) {
      await save({ ...resume, experiences: resume.experiences.filter((item) => item.id !== id) });
    },
    async updateExperienceBullets(experienceId: string, bullets: string[]) {
      await save({
        ...resume,
        experiences: resume.experiences.map((item) =>
          item.id === experienceId
            ? {
                ...item,
                bullets: bullets.map((text, index) => ({
                  id: makeId(),
                  experienceId,
                  text,
                  sortOrder: index,
                })),
              }
            : item,
        ),
      });
    },
    async createEducation(values: EducationDraft) {
      const id = makeId();
      await save({
        ...resume,
        education: [
          ...resume.education,
          { id, resumeId: resume.id, ...values, sortOrder: resume.education.length, bullets: [] },
        ],
      });
      return { id };
    },
    async updateEducation(id: string, values: EducationDraft) {
      await save({
        ...resume,
        education: resume.education.map((item) => (item.id === id ? { ...item, ...values } : item)),
      });
    },
    async deleteEducation(id: string) {
      await save({ ...resume, education: resume.education.filter((item) => item.id !== id) });
    },
    async createProject(values: ProjectDraft) {
      const id = makeId();
      await save({
        ...resume,
        projects: [
          ...resume.projects,
          {
            id,
            resumeId: resume.id,
            name: values.name,
            url: values.url,
            homepageUrl: values.homepageUrl,
            description: values.description,
            tech: JSON.stringify(values.tech),
            sortOrder: resume.projects.length,
          },
        ],
      });
      return { id };
    },
    async updateProject(id: string, values: ProjectDraft) {
      await save({
        ...resume,
        projects: resume.projects.map((item) =>
          item.id === id
            ? {
                ...item,
                name: values.name,
                url: values.url,
                homepageUrl: values.homepageUrl,
                description: values.description,
                tech: JSON.stringify(values.tech),
              }
            : item,
        ),
      });
    },
    async deleteProject(id: string) {
      await save({ ...resume, projects: resume.projects.filter((item) => item.id !== id) });
    },
    async createTalk(values: TalkDraft) {
      const id = makeId();
      await save({
        ...resume,
        talks: [
          ...resume.talks,
          {
            id,
            resumeId: resume.id,
            title: values.title,
            event: values.event,
            date: values.date,
            description: values.description,
            links: JSON.stringify(values.links ?? []),
            sortOrder: resume.talks.length,
          },
        ],
      });
      return { id };
    },
    async updateTalk(id: string, values: TalkDraft) {
      await save({
        ...resume,
        talks: resume.talks.map((item) =>
          item.id === id
            ? {
                ...item,
                title: values.title,
                event: values.event,
                date: values.date,
                description: values.description,
                links: JSON.stringify(values.links ?? []),
              }
            : item,
        ),
      });
    },
    async deleteTalk(id: string) {
      await save({ ...resume, talks: resume.talks.filter((item) => item.id !== id) });
    },
    async replaceDocument(doc: ResumeDocumentV1) {
      await save(
        resumeDocumentToDetail({
          id: resume.id,
          userId: resume.userId,
          name: resume.name,
          description: resume.description,
          jobDescription: resume.jobDescription,
          createdAt: resume.createdAt,
          doc,
        }),
      );
    },
  };
}
