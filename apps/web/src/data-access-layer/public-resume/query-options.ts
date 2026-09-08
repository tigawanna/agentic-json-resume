import { queryOptions } from "@tanstack/react-query";
import { getMyPublicResume, getPublicResume } from "./public-resume.functions";

export const publicResumeKeys = {
  all: ["public-resume"] as const,
  byId: (id: string) => [...publicResumeKeys.all, "by-id", id] as const,
  mine: (sourceResumeId: string) => [...publicResumeKeys.all, "mine", sourceResumeId] as const,
};

export const publicResumeQueryOptions = (id: string) =>
  queryOptions({
    queryKey: publicResumeKeys.byId(id),
    queryFn: () => getPublicResume({ data: { id } }),
  });

export const myPublicResumeQueryOptions = (sourceResumeId: string) =>
  queryOptions({
    queryKey: publicResumeKeys.mine(sourceResumeId),
    queryFn: () => getMyPublicResume({ data: { sourceResumeId } }),
  });
