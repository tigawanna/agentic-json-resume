import type { AppDb } from "./collection";
import type { Job, JobStatus } from "./schemas";
import { jobStatusSchema } from "./schemas";
import { joinSearchable, libraryRowBase, nowMs } from "@/routes/_dashboard/-utils/row-helpers";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  archived: "Archived",
};

export const JOB_STATUS_OPTIONS = jobStatusSchema.options.map((value) => ({
  value,
  label: JOB_STATUS_LABELS[value],
}));

export type JobDraft = {
  company: string;
  description: string;
  title?: string;
  url?: string;
  location?: string;
  status?: JobStatus;
  notes?: string;
  appliedAt?: number | null;
};

function jobSearchableText(draft: {
  company: string;
  title: string;
  description: string;
  location: string;
  url: string;
  notes: string;
}) {
  return joinSearchable(
    draft.company,
    draft.title,
    draft.location,
    draft.url,
    draft.notes,
    draft.description,
  );
}

function normalizeDraft(draft: JobDraft) {
  const company = draft.company.trim();
  const description = draft.description.trim();
  const title = draft.title?.trim() ?? "";
  const url = draft.url?.trim() ?? "";
  const location = draft.location?.trim() ?? "";
  const notes = draft.notes?.trim() ?? "";
  const status = draft.status ?? "saved";
  const appliedAt =
    draft.appliedAt === undefined
      ? status === "applied" || status === "interviewing" || status === "offer"
        ? nowMs()
        : null
      : draft.appliedAt;
  return { company, description, title, url, location, notes, status, appliedAt };
}

export function insertJob(db: AppDb, userId: string | null | undefined, draft: JobDraft): Job {
  const value = normalizeDraft(draft);
  if (!value.company) {
    throw new Error("Company name is required.");
  }
  if (!value.description) {
    throw new Error("Job description is required.");
  }
  const base = libraryRowBase(userId);
  const row: Job = {
    id: base.id,
    userId: userId ?? null,
    company: value.company,
    title: value.title,
    description: value.description,
    url: value.url,
    location: value.location,
    status: value.status,
    notes: value.notes,
    appliedAt: value.appliedAt,
    searchableText: jobSearchableText(value),
    embedding: null,
    embeddingModel: null,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  };
  db.collections.job.insert(row);
  return row;
}

export function updateJob(db: AppDb, jobId: string, draft: JobDraft): Job {
  const existing = db.collections.job.toArray.find((row) => row.id === jobId);
  if (!existing) {
    throw new Error(`Job ${jobId} was not found.`);
  }
  const value = normalizeDraft({
    company: draft.company,
    description: draft.description,
    title: draft.title ?? existing.title,
    url: draft.url ?? existing.url,
    location: draft.location ?? existing.location,
    status: draft.status ?? existing.status,
    notes: draft.notes ?? existing.notes,
    appliedAt: draft.appliedAt === undefined ? existing.appliedAt : draft.appliedAt,
  });
  if (!value.company) {
    throw new Error("Company name is required.");
  }
  if (!value.description) {
    throw new Error("Job description is required.");
  }
  db.collections.job.update(jobId, (row) => {
    row.company = value.company;
    row.title = value.title;
    row.description = value.description;
    row.url = value.url;
    row.location = value.location;
    row.status = value.status;
    row.notes = value.notes;
    row.appliedAt = value.appliedAt;
    row.searchableText = jobSearchableText(value);
    row.updatedAt = nowMs();
  });
  syncJobDescriptionToLinkedResumes(db, jobId, value.description);
  const updated = db.collections.job.toArray.find((row) => row.id === jobId);
  if (!updated) {
    throw new Error(`Job ${jobId} was not found after update.`);
  }
  return updated;
}

export function attachJobToResume(db: AppDb, resumeId: string, jobId: string | null) {
  const resume = db.collections.resume.toArray.find((row) => row.id === resumeId);
  if (!resume) {
    throw new Error(`Resume ${resumeId} was not found.`);
  }
  if (!jobId) {
    db.collections.resume.update(resumeId, (row) => {
      row.jobId = null;
      row.updatedAt = nowMs();
    });
    return;
  }
  const job = db.collections.job.toArray.find((row) => row.id === jobId);
  if (!job) {
    throw new Error(`Job ${jobId} was not found.`);
  }
  db.collections.resume.update(resumeId, (row) => {
    row.jobId = jobId;
    row.jobDescription = job.description;
    row.updatedAt = nowMs();
  });
}

export function syncJobDescriptionToLinkedResumes(db: AppDb, jobId: string, description: string) {
  for (const resume of db.collections.resume.toArray) {
    if (resume.jobId !== jobId) continue;
    db.collections.resume.update(resume.id, (row) => {
      row.jobDescription = description;
      row.updatedAt = nowMs();
    });
  }
}

export function unlinkJobFromResumes(db: AppDb, jobId: string) {
  for (const resume of db.collections.resume.toArray) {
    if (resume.jobId !== jobId) continue;
    db.collections.resume.update(resume.id, (row) => {
      row.jobId = null;
      row.updatedAt = nowMs();
    });
  }
}

export function deleteJob(db: AppDb, jobId: string) {
  unlinkJobFromResumes(db, jobId);
  db.collections.job.delete(jobId);
}

export function resolveJobDescription(
  resume: { jobId?: string | null; jobDescription: string },
  jobs: ReadonlyArray<Job>,
) {
  if (resume.jobId) {
    const job = jobs.find((row) => row.id === resume.jobId);
    if (job?.description.trim()) return job.description;
  }
  return resume.jobDescription;
}

export function jobListLabel(job: Pick<Job, "company" | "title">) {
  return job.title.trim() ? `${job.company} — ${job.title}` : job.company;
}

function normalizeJobDescription(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

function guessCompanyFromDescription(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  for (const line of lines.slice(0, 12)) {
    const labeled = line.match(/^(?:company|employer|organization|org)\s*[:\-–]\s*(.+)$/i);
    const value = labeled?.[1]?.trim();
    if (value && value.length <= 80) return value;
  }
  const first = lines[0];
  if (first && first.length <= 60 && !first.includes(".") && first.split(/\s+/).length <= 8) {
    return first;
  }
  return "";
}

function guessCompanyFromResume(resume: { name: string; jobDescription: string }) {
  const fromDescription = guessCompanyFromDescription(resume.jobDescription);
  if (fromDescription) return fromDescription;
  const name = resume.name.trim();
  if (name && !/^(untitled|new resume|resume|copy)(\s|$)/i.test(name)) return name;
  return "";
}

export type JobImportGroup = {
  key: string;
  description: string;
  resumeIds: string[];
  resumeNames: string[];
  suggestedCompany: string;
  existingJobId: string | null;
};

/** Résumés with a pasted JD that are not already linked to a live job row. */
export function listJobImportGroups(db: AppDb): JobImportGroup[] {
  const jobs = db.collections.job.toArray;
  const groups = new Map<string, JobImportGroup>();

  for (const resume of db.collections.resume.toArray) {
    const description = resume.jobDescription.trim();
    if (!description) continue;
    if (resume.jobId && jobs.some((job) => job.id === resume.jobId)) continue;

    const key = normalizeJobDescription(description);
    const existing = jobs.find((job) => normalizeJobDescription(job.description) === key);
    const suggested = guessCompanyFromResume(resume);
    const group = groups.get(key);
    if (group) {
      group.resumeIds.push(resume.id);
      group.resumeNames.push(resume.name);
      if (!group.suggestedCompany && suggested) group.suggestedCompany = suggested;
      continue;
    }
    groups.set(key, {
      key,
      description,
      resumeIds: [resume.id],
      resumeNames: [resume.name],
      suggestedCompany: suggested || existing?.company || "",
      existingJobId: existing?.id ?? null,
    });
  }

  return [...groups.values()];
}

export function importJobsFromResumeGroups(
  db: AppDb,
  userId: string | null | undefined,
  groups: ReadonlyArray<JobImportGroup>,
  selections: ReadonlyArray<{ key: string; company: string; title?: string }>,
) {
  let created = 0;
  let reused = 0;
  let attached = 0;
  let skipped = 0;

  for (const selection of selections) {
    const group = groups.find((item) => item.key === selection.key);
    const company = selection.company.trim();
    if (!group || !company) {
      skipped += 1;
      continue;
    }

    const existing = group.existingJobId
      ? db.collections.job.toArray.find((row) => row.id === group.existingJobId)
      : undefined;
    let jobId: string;
    if (existing) {
      reused += 1;
      jobId = existing.id;
    } else {
      jobId = insertJob(db, userId, {
        company,
        description: group.description,
        title: selection.title,
      }).id;
      created += 1;
    }
    const nextJob = db.collections.job.toArray.find((row) => row.id === jobId);
    if (!nextJob) {
      throw new Error("Job was not found after import.");
    }

    for (const resumeId of group.resumeIds) {
      attachJobToResume(db, resumeId, nextJob.id);
      attached += 1;
    }
  }

  return { created, reused, attached, skipped };
}
