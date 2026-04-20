import { getTanstackQueryContext } from "@/lib/tanstack/query/query-provider";
import { createCollection, parseWhereExpression } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { queryOptions } from "@tanstack/react-query";
import { queryKeyPrefixes } from "../../query-keys";
import { listEducation } from "./education.functions";

type EducationPaginationMeta = {
  nextCursor: string | undefined;
  previousCursor: string | undefined;
};

export const educationCollectionMetaQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.education, "pagination", "meta"],
  queryFn: async (): Promise<EducationPaginationMeta> => ({
    nextCursor: undefined,
    previousCursor: undefined,
  }),
});

export const educationCollection = createCollection(
  queryCollectionOptions({
    id: "education-list",
    queryKey: [queryKeyPrefixes.education, "pagination"],
    syncMode: "on-demand",
    queryFn: async (ctx) => {
      const where = ctx.meta?.loadSubsetOptions?.where;
      let keyword: string | undefined;
      let cursorValue: string | undefined;

      if (where) {
        parseWhereExpression(where, {
          handlers: {
            gt: (_field, value) => {
              cursorValue = value as string;
            },
            ilike: (_field, value: unknown) => {
              if (typeof value === "string" && !keyword) {
                keyword = value.replaceAll("%", "");
              }
            },
            or: (...conditions) => conditions,
          },
        });
      }

      const result = await listEducation({
        data: { keyword, cursor: cursorValue },
      });
      console.log("listEducation next cursor== ", result.nextCursor);
      await ctx.client.setQueryData(educationCollectionMetaQueryOptions.queryKey, {
        nextCursor: result.nextCursor,
        previousCursor: result.previousCursor,
      });

      return result;
    },
    select: (result) => result.items,
    getKey: (item) => item.id,
    queryClient: getTanstackQueryContext().queryClient,
  }),
);
