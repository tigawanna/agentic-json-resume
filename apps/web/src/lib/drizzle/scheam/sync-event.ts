import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

/**
 * Append-only event log for managed sync.
 * `user_id` is stamped from the session on push — never trusted from the client.
 */
export const syncEvent = sqliteTable(
  "sync_event",
  {
    globalSeq: integer("global_seq").primaryKey({ autoIncrement: true }),
    eventId: text("event_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    collectionId: text("collection_id").notNull(),
    type: text("type", { enum: ["insert", "update", "delete"] }).notNull(),
    key: text("key").notNull(),
    payload: text("payload").notNull(),
    previous: text("previous"),
    txId: text("tx_id").notNull(),
    clientId: text("client_id").notNull(),
    schemaVersion: integer("schema_version").default(1).notNull(),
    clientTimestamp: integer("client_timestamp").notNull(),
    serverTimestamp: integer("server_timestamp", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    projectedAt: integer("projected_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    uniqueIndex("sync_event_eventId_idx").on(table.eventId),
    index("sync_event_userId_globalSeq_idx").on(table.userId, table.globalSeq),
    index("sync_event_row_idx").on(table.collectionId, table.key, table.globalSeq),
    index("sync_event_projectedAt_idx").on(table.projectedAt),
  ],
);

/** Singleton identity of this event store. `id` is always 1. */
export const syncBackend = sqliteTable("sync_backend", {
  id: integer("id").primaryKey(),
  backendId: text("backend_id").notNull(),
  lastProjectedSeq: integer("last_projected_seq").default(0).notNull(),
});
