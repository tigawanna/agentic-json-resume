import { queryClient } from "@/lib/tanstack/query/queryclient";
import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { queryKeyPrefixes } from "../query-keys";
import { getSavedProjects } from "./saved-project.functions";

export const savedProjectsCollection = createCollection(
  queryCollectionOptions({
    queryKey: [queryKeyPrefixes.savedProjects] as const,
    queryFn: async () => {
      return getSavedProjects();
    },
    getKey: (item) => item.id,
    queryClient: queryClient,
  }),
);
