import { queryOptions } from "@tanstack/react-query";
import { getMyPublicResume, getPublicResume, listMyPublicResumes } from "./public-resume.functions";

export const publicResumeKeys = {
  all: ["public-resume"] as const,
  byId: (id: string) => [...publicResumeKeys.all, "by-id", id] as const,
  mine: (sourceResumeId: string) => [...publicResumeKeys.all, "mine", sourceResumeId] as const,
  list: (opts?: { keyword?: string; page?: number }) =>
    [...publicResumeKeys.all, "list", opts?.keyword ?? "", opts?.page ?? 1] as const,
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

export const myPublicResumesListQueryOptions = (opts: {
  keyword?: string;
  page?: number;
  limit: number;
}) => {
  const page = opts.page && opts.page > 0 ? opts.page : 1;
  const offset = (page - 1) * opts.limit;
  return queryOptions({
    queryKey: publicResumeKeys.list({ keyword: opts.keyword, page }),
    queryFn: () =>
      listMyPublicResumes({
        data: {
          keyword: opts.keyword,
          limit: opts.limit,
          offset,
        },
      }),
  });
};
