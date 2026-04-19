import { queryClient } from "@/lib/tanstack/query/queryclient";
import { createCollection, parseLoadSubsetOptions } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { listResumes } from "./resume.functions";
import type { ResumeListItemDTO } from "./resume.types";

export const resumeCollection = createCollection(
  queryCollectionOptions<ResumeListItemDTO, string>({
    id: "resumes",
    queryKey: ["resumes"],
    syncMode: "on-demand",
    queryFn: (ctx) => {
      const parsed = parseLoadSubsetOptions(ctx.meta?.loadSubsetOptions);
      const whereId = parsed.filters.find(
        ({ field, operator }) => field.join(".") === "id" && operator === "eq",
      );
      return listResumes({ data: { id: whereId?.value } });
    },
    getKey: (resume) => resume.id,
    queryClient,
  }),
);
