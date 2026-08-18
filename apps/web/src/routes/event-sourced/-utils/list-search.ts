import { z } from "zod";

/** Shared `q` + `page` contract for event-sourced library lists. */
export const eventSourcedListSearchSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export type EventSourcedListSearch = z.infer<typeof eventSourcedListSearchSchema>;

export const eventQueueTabSchema = z.enum(["outbox", "inbox", "deadletter"]);
export type EventQueueTab = z.infer<typeof eventQueueTabSchema>;

export const eventQueueSearchSchema = eventSourcedListSearchSchema.extend({
  tab: eventQueueTabSchema.optional(),
});

export type EventQueueSearch = z.infer<typeof eventQueueSearchSchema>;
