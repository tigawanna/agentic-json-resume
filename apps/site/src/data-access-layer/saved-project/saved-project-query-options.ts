import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { queryOptions } from "@tanstack/react-query";
import { listSavedProjects } from "./saved-project.functions";
import type { SavedProjectDTO } from "./saved-project.types";

export function savedProjectsListQueryOptions(q: string) {
  return queryOptions({
    queryKey: [queryKeyPrefixes.savedProjects, "list", q],
    queryFn: async (): Promise<SavedProjectDTO[]> =>
      listSavedProjects({ data: { q: q.trim() || undefined } }),
  });
}
