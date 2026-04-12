import { queryOptions } from "@tanstack/react-query";
import { listResumes, getResume } from "./resume.server-fns";

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
