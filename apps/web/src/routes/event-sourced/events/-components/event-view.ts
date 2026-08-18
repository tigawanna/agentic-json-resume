import type { InboxEntry, MutationType, OutboxEntry } from "event-sourced-collection";

export { formatLocaleDateTime as formatEventDate } from "@/utils/date-helpers";

export type SyncEventView = {
  id: string;
  eventId: string;
  collectionId: string;
  type: MutationType;
  key: string;
  payload: Record<string, unknown>;
  timestamp: number;
  sync: boolean;
  globalSeq: number | null;
};

export function toEventView(entry: OutboxEntry | InboxEntry): SyncEventView {
  return {
    id: entry.eventId,
    eventId: entry.eventId,
    collectionId: entry.collectionId,
    type: entry.type,
    key: String(entry.key),
    payload: entry.payload,
    timestamp: entry.timestamp,
    sync: entry.sync,
    globalSeq: entry.globalSeq ?? null,
  };
}
