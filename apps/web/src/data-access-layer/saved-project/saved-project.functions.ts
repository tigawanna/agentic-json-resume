import { projectItemSchema, type ResumeProjectItem } from "@/features/resume/resume-schema";
import { createServerFn } from "@tanstack/react-start";
import {
  createSavedProjectForCurrentUser,
  deleteSavedProjectForCurrentUser,
  listSavedProjectsForCurrentUser,
} from "./saved-project.server";
import type { SavedProjectDTO } from "./saved-project.types";

export const listSavedProjects = createServerFn({ method: "GET" })
  .inputValidator((input: { q?: string }) => input)
  .handler(async ({ data }): Promise<SavedProjectDTO[]> => {
    return listSavedProjectsForCurrentUser(data.q?.trim() || undefined);
  });

export const createSavedProject = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): ResumeProjectItem => projectItemSchema.parse(input))
  .handler(async ({ data }): Promise<SavedProjectDTO> => {
    return createSavedProjectForCurrentUser(data);
  });

export const deleteSavedProject = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    return deleteSavedProjectForCurrentUser(data.id);
  });
