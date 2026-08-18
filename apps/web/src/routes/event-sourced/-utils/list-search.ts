import { z } from "zod";

/** Shared `q` + `page` contract for event-sourced library lists. */
export const eventSourcedListSearchSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export type EventSourcedListSearch = z.infer<typeof eventSourcedListSearchSchema>;
