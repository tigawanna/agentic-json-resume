import { tanstackDBPersistence } from "@/lib/tanstack/db/browser-presistor";
import { persistedCollectionOptions } from "@tanstack/browser-db-sqlite-persistence";
import { createCollection } from "@tanstack/db";
import type { ResumeDetailDTO } from "@/data-access-layer/resume/resume.types";

export const localResumeCollection = createCollection(
  persistedCollectionOptions<ResumeDetailDTO, string>({
    id: "local-resume-workbench",
    persistence: tanstackDBPersistence,
    schemaVersion: 1,
    getKey: (resume) => resume.id,
  }),
);

export async function persistLocalResume(resume: ResumeDetailDTO) {
  await localResumeCollection.preload();
  const existing = localResumeCollection.state.has(resume.id);
  const tx = existing
    ? localResumeCollection.update(resume.id, (draft) => {
        Object.assign(draft, resume);
      })
    : localResumeCollection.insert(resume);
  await tx.isPersisted.promise;
}
