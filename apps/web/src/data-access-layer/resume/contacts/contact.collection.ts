import { queryClient } from "@/lib/tanstack/query/queryclient";
import { createCollection, parseWhereExpression } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { queryKeyPrefixes } from "../../query-keys";
import { listContacts } from "./contact.functions";

export const contactsCollection = createCollection(
  queryCollectionOptions({
    id: "contacts-list",
    queryKey: [queryKeyPrefixes.contacts],
    syncMode: "on-demand",
    queryFn: async (ctx) => {
      const where = ctx.meta?.loadSubsetOptions?.where;
      let keyword: string | undefined;
      if (where) {
        parseWhereExpression(where, {
          handlers: {
            ilike: (_field, value: unknown) => {
              if (typeof value === "string" && !keyword) {
                keyword = value.replaceAll("%", "");
              }
            },
            or: (...conditions) => conditions,
          },
        });
      }
      return listContacts({ data: keyword ? { keyword } : undefined }) ?? [];
    },
    getKey: (item) => item.id,
    queryClient,
  }),
);
