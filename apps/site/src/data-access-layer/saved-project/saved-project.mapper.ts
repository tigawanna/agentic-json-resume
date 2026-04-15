import type { ResumeProjectItem } from "@/features/resume/resume-schema";
import { projectItemSchema } from "@/features/resume/resume-schema";
import type { SavedProjectDTO } from "./saved-project.types";

export function savedProjectDtoToResumeItem(dto: SavedProjectDTO): ResumeProjectItem {
  return projectItemSchema.parse({
    name: dto.name,
    url: dto.url,
    homepageUrl: dto.homepageUrl || undefined,
    description: dto.description,
    tech: dto.tech,
  });
}
