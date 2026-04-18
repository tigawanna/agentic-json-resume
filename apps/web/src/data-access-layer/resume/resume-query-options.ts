import { queryOptions } from "@tanstack/react-query";
import {
  getResume,
  listResumes,
  searchEducation,
  searchExperienceBullets,
  searchExperiences,
  searchProjects,
  searchSkills,
} from "./resume.functions";

export const resumeListQueryOptions = queryOptions({
  queryKey: ["resumes"],
  queryFn: () => listResumes(),
});

export function resumeDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["resumes", id],
    queryFn: () => getResume({ data: { id } }),
  });
}

export function experienceBulletsSearchQueryOptions(query: string) {
  return queryOptions({
    queryKey: ["resumes", "search", "experience-bullets", query] as const,
    queryFn: () => searchExperienceBullets({ data: { query } }),
    enabled: true,
  });
}

export function experiencesSearchQueryOptions(query: string) {
  return queryOptions({
    queryKey: ["resumes", "search", "experiences", query] as const,
    queryFn: () => searchExperiences({ data: { query } }),
  });
}

export function projectsSearchQueryOptions(query: string) {
  return queryOptions({
    queryKey: ["resumes", "search", "projects", query] as const,
    queryFn: () => searchProjects({ data: { query } }),
  });
}

export function educationSearchQueryOptions(query: string) {
  return queryOptions({
    queryKey: ["resumes", "search", "education", query] as const,
    queryFn: () => searchEducation({ data: { query } }),
  });
}

export function skillsSearchQueryOptions(query: string) {
  return queryOptions({
    queryKey: ["resumes", "search", "skills", query] as const,
    queryFn: () => searchSkills({ data: { query } }),
  });
}
