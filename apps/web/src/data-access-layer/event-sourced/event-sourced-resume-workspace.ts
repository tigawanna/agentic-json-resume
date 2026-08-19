import { documentToInsertData } from "@/data-access-layer/resume/resume-converters";
import type { ResumeDetailDTO } from "@/data-access-layer/resume/resume.types";
import type { ResumeDocumentV1 } from "@/features/resume/resume-schema";
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
} from "@/components/resume/resume-workspace/resume-workspace-types";
import type { AppDb } from "./collection";
import type { EventSourcedResumeSnapshots } from "./assemble-resume-detail";
import {
  appendResumeItemOrder,
  junctionEntityIds,
  removeResumeItemOrder,
  reorderResumeItems,
} from "./resume-item-order";
import {
  joinSearchable,
  libraryRowBase,
  newId,
  nowMs,
} from "@/routes/_dashboard/-utils/row-helpers";

function matchQuery(query: string, ...parts: Array<string | null | undefined>) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return parts.some((part) => (part ?? "").toLowerCase().includes(needle));
}

function deleteResumeItems<T extends { id: string; resumeId: string }>(
  collection: { delete: (id: string) => void },
  items: T[],
  resumeId: string,
) {
  for (const item of items) {
    if (item.resumeId === resumeId) collection.delete(item.id);
  }
}

function junctionFields(resumeId: string, sortOrder: number) {
  const ts = nowMs();
  return {
    id: newId(),
    resumeId,
    sortOrder,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function createEventSourcedResumeWorkspace(
  db: AppDb,
  detail: ResumeDetailDTO,
  snapshots: EventSourcedResumeSnapshots,
): ResumeWorkspaceAdapter {
  const resumeId = detail.id;
  const userId = detail.userId;

  return {
    mode: "local",
    resume: detail,
    searches: {
      experiences: async (query) =>
        snapshots.experiences
          .filter((row) => matchQuery(query, row.company, row.role, row.location))
          .map((row) => ({
            id: row.id,
            company: row.company,
            role: row.role,
            startDate: row.startDate,
            endDate: row.endDate,
          })),
      experienceBullets: async (query) =>
        snapshots.experienceBullets
          .filter((row) => matchQuery(query, row.text))
          .map((row) => ({ id: row.id, text: row.text })),
      education: async (query) =>
        snapshots.education
          .filter((row) => matchQuery(query, row.school, row.degree, row.field))
          .map((row) => ({
            id: row.id,
            school: row.school,
            degree: row.degree,
            field: row.field,
          })),
      projects: async (query) =>
        snapshots.projects
          .filter((row) => matchQuery(query, row.name, row.description, row.url, row.tech))
          .map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            url: row.url,
            homepageUrl: row.homepageUrl,
            tech: row.tech,
          })),
      skills: async (query) => {
        const groups = new Map(snapshots.skillGroups.map((group) => [group.id, group.name]));
        return snapshots.skills
          .filter((row) => matchQuery(query, row.name, groups.get(row.groupId)))
          .map((row) => ({
            id: row.id,
            name: row.name,
            groupName: groups.get(row.groupId),
          }));
      },
      talks: async (query) =>
        snapshots.talks
          .filter((row) => matchQuery(query, row.title, row.event, row.description))
          .map((row) => ({
            id: row.id,
            title: row.title,
            event: row.event,
            date: row.date,
          })),
    },
    async updateMetadata(values: ResumeMetadataDraft) {
      db.collections.resume.update(resumeId, (draft) => {
        draft.name = values.name;
        draft.fullName = values.fullName;
        draft.headline = values.headline;
        draft.description = values.description;
        draft.jobDescription = values.jobDescription;
        draft.templateId = values.templateId;
        draft.searchableText = joinSearchable(
          values.name,
          values.fullName,
          values.headline,
          values.description,
        );
        draft.updatedAt = nowMs();
      });
    },
    async updateContacts(contacts: ContactDraft[]) {
      deleteResumeItems(db.collections.resumeContactItem, snapshots.contactItems, resumeId);
      contacts.forEach((contact, index) => {
        const base = libraryRowBase(userId);
        db.collections.resumeContact.insert({
          ...base,
          type: contact.type,
          value: contact.value,
          label: contact.label,
          sortOrder: index,
          searchableText: joinSearchable(contact.type, contact.value, contact.label),
        });
        db.collections.resumeContactItem.insert({
          ...junctionFields(resumeId, index),
          contactId: base.id,
        });
      });
    },
    async updateLinks(links: LinkDraft[]) {
      deleteResumeItems(db.collections.resumeLinkItem, snapshots.linkItems, resumeId);
      links.forEach((link, index) => {
        const base = libraryRowBase(userId);
        db.collections.resumeLink.insert({
          ...base,
          label: link.label,
          url: link.url,
          icon: link.icon ?? null,
          sortOrder: index,
          searchableText: joinSearchable(link.label, link.url),
        });
        db.collections.resumeLinkItem.insert({
          ...junctionFields(resumeId, index),
          linkId: base.id,
        });
      });
    },
    async updateSummary(text: string) {
      deleteResumeItems(db.collections.resumeSummaryItem, snapshots.summaryItems, resumeId);
      if (!text.trim()) return;
      const base = libraryRowBase(userId);
      db.collections.resumeSummary.insert({
        ...base,
        text,
        sortOrder: 0,
        searchableText: text,
      });
      db.collections.resumeSummaryItem.insert({
        ...junctionFields(resumeId, 0),
        summaryId: base.id,
      });
    },
    async updateNotes(values: { label: string; text: string }) {
      deleteResumeItems(db.collections.resumeNoteItem, snapshots.noteItems, resumeId);
      if (!values.text.trim()) return;
      const base = libraryRowBase(userId);
      db.collections.resumeNote.insert({
        ...base,
        label: values.label.trim() || "Notes",
        text: values.text,
        sortOrder: 0,
        searchableText: joinSearchable(values.label, values.text),
      });
      db.collections.resumeNoteItem.insert({
        ...junctionFields(resumeId, 0),
        noteId: base.id,
      });
    },
    async updateSkillGroups(groups: SkillGroupDraft[]) {
      deleteResumeItems(db.collections.resumeSkillGroupItem, snapshots.skillGroupItems, resumeId);
      groups.forEach((group, groupIndex) => {
        const base = libraryRowBase(userId);
        db.collections.resumeSkillGroup.insert({
          ...base,
          name: group.name,
          sortOrder: groupIndex,
          searchableText: joinSearchable(group.name, ...group.items),
        });
        db.collections.resumeSkillGroupItem.insert({
          ...junctionFields(resumeId, groupIndex),
          groupId: base.id,
        });
        group.items.forEach((name, skillIndex) => {
          const skillBase = libraryRowBase(userId);
          db.collections.resumeSkill.insert({
            id: skillBase.id,
            groupId: base.id,
            name,
            level: null,
            sortOrder: skillIndex,
            searchableText: name,
            embedding: null,
            embeddingModel: null,
            createdAt: skillBase.createdAt,
            updatedAt: skillBase.updatedAt,
          });
        });
      });
    },
    async createExperience(values: ExperienceDraft) {
      const base = libraryRowBase(userId);
      const sortOrder = snapshots.experienceItems.filter(
        (item) => item.resumeId === resumeId,
      ).length;
      db.collections.resumeExperience.insert({
        ...base,
        ...values,
        sortOrder,
        searchableText: joinSearchable(values.company, values.role, values.location),
      });
      db.collections.resumeExperienceItem.insert({
        ...junctionFields(resumeId, sortOrder),
        experienceId: base.id,
      });
      appendResumeItemOrder(
        db,
        resumeId,
        "experienceOrder",
        base.id,
        junctionEntityIds(snapshots.experienceItems, resumeId, "experienceId"),
      );
      return { id: base.id };
    },
    async updateExperience(id: string, values: ExperienceDraft) {
      db.collections.resumeExperience.update(id, (draft) => {
        draft.company = values.company;
        draft.role = values.role;
        draft.startDate = values.startDate;
        draft.endDate = values.endDate;
        draft.location = values.location;
        draft.searchableText = joinSearchable(values.company, values.role, values.location);
        draft.updatedAt = nowMs();
      });
    },
    async deleteExperience(id: string) {
      for (const item of snapshots.experienceItems) {
        if (item.resumeId === resumeId && item.experienceId === id) {
          db.collections.resumeExperienceItem.delete(item.id);
        }
      }
      removeResumeItemOrder(db, resumeId, "experienceOrder", id);
    },
    async reorderExperience(idA: string, idB: string) {
      reorderResumeItems(
        db,
        resumeId,
        "experienceOrder",
        idA,
        idB,
        snapshots.experienceItems,
        "experienceId",
        db.collections.resumeExperienceItem,
      );
    },
    async updateExperienceBullets(experienceId: string, bullets: string[]) {
      for (const bullet of snapshots.experienceBullets) {
        if (bullet.experienceId === experienceId) {
          db.collections.resumeExperienceBullet.delete(bullet.id);
        }
      }
      bullets.forEach((text, index) => {
        const base = libraryRowBase(userId);
        db.collections.resumeExperienceBullet.insert({
          id: base.id,
          experienceId,
          text,
          sortOrder: index,
          searchableText: text,
          embedding: null,
          embeddingModel: null,
          createdAt: base.createdAt,
          updatedAt: base.updatedAt,
        });
      });
    },
    async createEducation(values: EducationDraft) {
      const base = libraryRowBase(userId);
      const sortOrder = snapshots.educationItems.filter(
        (item) => item.resumeId === resumeId,
      ).length;
      db.collections.resumeEducation.insert({
        ...base,
        ...values,
        sortOrder,
        searchableText: joinSearchable(values.school, values.degree, values.field),
      });
      db.collections.resumeEducationItem.insert({
        ...junctionFields(resumeId, sortOrder),
        educationId: base.id,
      });
      appendResumeItemOrder(
        db,
        resumeId,
        "educationOrder",
        base.id,
        junctionEntityIds(snapshots.educationItems, resumeId, "educationId"),
      );
      return { id: base.id };
    },
    async updateEducation(id: string, values: EducationDraft) {
      db.collections.resumeEducation.update(id, (draft) => {
        draft.school = values.school;
        draft.degree = values.degree;
        draft.field = values.field;
        draft.startDate = values.startDate;
        draft.endDate = values.endDate;
        draft.description = values.description;
        draft.searchableText = joinSearchable(values.school, values.degree, values.field);
        draft.updatedAt = nowMs();
      });
    },
    async deleteEducation(id: string) {
      for (const item of snapshots.educationItems) {
        if (item.resumeId === resumeId && item.educationId === id) {
          db.collections.resumeEducationItem.delete(item.id);
        }
      }
      removeResumeItemOrder(db, resumeId, "educationOrder", id);
    },
    async reorderEducation(idA: string, idB: string) {
      reorderResumeItems(
        db,
        resumeId,
        "educationOrder",
        idA,
        idB,
        snapshots.educationItems,
        "educationId",
        db.collections.resumeEducationItem,
      );
    },
    async createProject(values: ProjectDraft) {
      const base = libraryRowBase(userId);
      const sortOrder = snapshots.projectItems.filter((item) => item.resumeId === resumeId).length;
      db.collections.resumeProject.insert({
        ...base,
        name: values.name,
        url: values.url,
        homepageUrl: values.homepageUrl,
        description: values.description,
        tech: JSON.stringify(values.tech),
        sortOrder,
        searchableText: joinSearchable(values.name, values.description, values.url),
      });
      db.collections.resumeProjectItem.insert({
        ...junctionFields(resumeId, sortOrder),
        projectId: base.id,
      });
      appendResumeItemOrder(
        db,
        resumeId,
        "projectOrder",
        base.id,
        junctionEntityIds(snapshots.projectItems, resumeId, "projectId"),
      );
      return { id: base.id };
    },
    async updateProject(id: string, values: ProjectDraft) {
      db.collections.resumeProject.update(id, (draft) => {
        draft.name = values.name;
        draft.url = values.url;
        draft.homepageUrl = values.homepageUrl;
        draft.description = values.description;
        draft.tech = JSON.stringify(values.tech);
        draft.searchableText = joinSearchable(values.name, values.description, values.url);
        draft.updatedAt = nowMs();
      });
    },
    async deleteProject(id: string) {
      for (const item of snapshots.projectItems) {
        if (item.resumeId === resumeId && item.projectId === id) {
          db.collections.resumeProjectItem.delete(item.id);
        }
      }
      removeResumeItemOrder(db, resumeId, "projectOrder", id);
    },
    async reorderProject(idA: string, idB: string) {
      reorderResumeItems(
        db,
        resumeId,
        "projectOrder",
        idA,
        idB,
        snapshots.projectItems,
        "projectId",
        db.collections.resumeProjectItem,
      );
    },
    async createTalk(values: TalkDraft) {
      const base = libraryRowBase(userId);
      const sortOrder = snapshots.talkItems.filter((item) => item.resumeId === resumeId).length;
      db.collections.resumeTalk.insert({
        ...base,
        title: values.title,
        event: values.event,
        date: values.date,
        description: values.description,
        links: JSON.stringify(values.links ?? []),
        sortOrder,
        searchableText: joinSearchable(values.title, values.event, values.description),
      });
      db.collections.resumeTalkItem.insert({
        ...junctionFields(resumeId, sortOrder),
        talkId: base.id,
      });
      appendResumeItemOrder(
        db,
        resumeId,
        "talkOrder",
        base.id,
        junctionEntityIds(snapshots.talkItems, resumeId, "talkId"),
      );
      return { id: base.id };
    },
    async updateTalk(id: string, values: TalkDraft) {
      db.collections.resumeTalk.update(id, (draft) => {
        draft.title = values.title;
        draft.event = values.event;
        draft.date = values.date;
        draft.description = values.description;
        draft.links = JSON.stringify(values.links ?? []);
        draft.searchableText = joinSearchable(values.title, values.event, values.description);
        draft.updatedAt = nowMs();
      });
    },
    async deleteTalk(id: string) {
      for (const item of snapshots.talkItems) {
        if (item.resumeId === resumeId && item.talkId === id) {
          db.collections.resumeTalkItem.delete(item.id);
        }
      }
      removeResumeItemOrder(db, resumeId, "talkOrder", id);
    },
    async reorderTalk(idA: string, idB: string) {
      reorderResumeItems(
        db,
        resumeId,
        "talkOrder",
        idA,
        idB,
        snapshots.talkItems,
        "talkId",
        db.collections.resumeTalkItem,
      );
    },
    async replaceDocument(doc: ResumeDocumentV1) {
      const data = documentToInsertData(resumeId, userId, doc);
      const ts = nowMs();

      db.collections.resume.update(resumeId, (draft) => {
        draft.fullName = data.resume.fullName;
        draft.headline = data.resume.headline;
        draft.templateId = data.resume.templateId;
        draft.experienceOrder = data.experiences.map((experience) => experience.id);
        draft.educationOrder = data.education.map((education) => education.id);
        draft.projectOrder = data.projects.map((project) => project.id);
        draft.talkOrder = data.talks.map((talk) => talk.id);
        draft.searchableText = joinSearchable(
          draft.name,
          data.resume.fullName,
          data.resume.headline,
          draft.description,
        );
        draft.updatedAt = ts;
      });

      for (const section of snapshots.sections) {
        if (section.resumeId === resumeId) db.collections.resumeSection.delete(section.id);
      }
      for (const section of data.sections) {
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

      await this.updateContacts(
        data.contacts.map((contact) => ({
          type: contact.type,
          value: contact.value,
          label: contact.label,
        })),
      );
      await this.updateLinks(
        data.links.map((link) => ({
          label: link.label,
          url: link.url,
          icon: link.icon ?? undefined,
        })),
      );
      await this.updateSummary(data.summaries[0]?.text ?? "");
      const note = data.notes[0];
      await this.updateNotes({
        label: note?.label ?? "Notes",
        text: note?.text ?? "",
      });
      await this.updateSkillGroups(
        data.skillGroups.map((group) => ({
          name: group.name,
          items: data.skills
            .filter((skill) => skill.groupId === group.id)
            .map((skill) => skill.name),
        })),
      );

      deleteResumeItems(db.collections.resumeExperienceItem, snapshots.experienceItems, resumeId);
      deleteResumeItems(db.collections.resumeEducationItem, snapshots.educationItems, resumeId);
      deleteResumeItems(db.collections.resumeProjectItem, snapshots.projectItems, resumeId);
      deleteResumeItems(db.collections.resumeTalkItem, snapshots.talkItems, resumeId);

      for (const experience of data.experiences) {
        const base = libraryRowBase(userId);
        const id = experience.id;
        db.collections.resumeExperience.insert({
          ...base,
          id,
          company: experience.company,
          role: experience.role,
          startDate: experience.startDate,
          endDate: experience.endDate,
          location: experience.location,
          sortOrder: experience.sortOrder,
          searchableText: joinSearchable(experience.company, experience.role, experience.location),
        });
        db.collections.resumeExperienceItem.insert({
          ...junctionFields(resumeId, experience.sortOrder),
          experienceId: id,
        });
      }
      for (const bullet of data.experienceBullets) {
        const base = libraryRowBase(userId);
        db.collections.resumeExperienceBullet.insert({
          id: bullet.id,
          experienceId: bullet.experienceId,
          text: bullet.text,
          sortOrder: bullet.sortOrder,
          searchableText: bullet.text,
          embedding: null,
          embeddingModel: null,
          createdAt: base.createdAt,
          updatedAt: base.updatedAt,
        });
      }

      for (const education of data.education) {
        db.collections.resumeEducation.insert({
          ...libraryRowBase(userId),
          id: education.id,
          school: education.school,
          degree: education.degree,
          field: education.field,
          startDate: education.startDate,
          endDate: education.endDate,
          description: education.description,
          sortOrder: education.sortOrder,
          searchableText: joinSearchable(education.school, education.degree, education.field),
        });
        db.collections.resumeEducationItem.insert({
          ...junctionFields(resumeId, education.sortOrder),
          educationId: education.id,
        });
      }
      for (const bullet of data.educationBullets) {
        const base = libraryRowBase(userId);
        db.collections.resumeEducationBullet.insert({
          id: bullet.id,
          educationId: bullet.educationId,
          text: bullet.text,
          sortOrder: bullet.sortOrder,
          searchableText: bullet.text,
          embedding: null,
          embeddingModel: null,
          createdAt: base.createdAt,
          updatedAt: base.updatedAt,
        });
      }

      for (const project of data.projects) {
        db.collections.resumeProject.insert({
          ...libraryRowBase(userId),
          id: project.id,
          name: project.name,
          url: project.url,
          homepageUrl: project.homepageUrl,
          description: project.description,
          tech: project.tech,
          sortOrder: project.sortOrder,
          searchableText: joinSearchable(project.name, project.description, project.url),
        });
        db.collections.resumeProjectItem.insert({
          ...junctionFields(resumeId, project.sortOrder),
          projectId: project.id,
        });
      }

      for (const talk of data.talks) {
        db.collections.resumeTalk.insert({
          ...libraryRowBase(userId),
          id: talk.id,
          title: talk.title,
          event: talk.event,
          date: talk.date,
          description: talk.description,
          links: talk.links,
          sortOrder: talk.sortOrder,
          searchableText: joinSearchable(talk.title, talk.event, talk.description),
        });
        db.collections.resumeTalkItem.insert({
          ...junctionFields(resumeId, talk.sortOrder),
          talkId: talk.id,
        });
      }
    },
  };
}
