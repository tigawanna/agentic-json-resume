import type { AppDb } from "@/data-access-layer/event-sourced/collection";
import type { ChatClientPersistence, ChatPersistedState } from "@tanstack/ai-client";
import { nowMs } from "../../-utils/row-helpers";

function isPersistedState(value: unknown): value is ChatPersistedState {
  return (
    typeof value === "object" &&
    value !== null &&
    "messages" in value &&
    Array.isArray((value as { messages: unknown }).messages)
  );
}

function parseStoredMessages(raw: string): ChatPersistedState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return { messages: parsed };
    return isPersistedState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function createEventSourcedChatPersistence(options: {
  getDb: () => AppDb;
  getUserId: () => string;
  resumeId: string;
}): ChatClientPersistence {
  const { resumeId } = options;

  return {
    getItem() {
      const row = options.getDb().collections.resumeAiChat.get(resumeId);
      if (!row) return null;
      return parseStoredMessages(row.messages);
    },
    setItem(_id, state) {
      const db = options.getDb();
      const userId = options.getUserId();
      if (!userId) return;
      const payload = JSON.stringify(state);
      const ts = nowMs();
      if (db.collections.resumeAiChat.has(resumeId)) {
        db.collections.resumeAiChat.update(resumeId, (draft) => {
          draft.messages = payload;
          draft.userId = userId;
          draft.updatedAt = ts;
        });
        return;
      }
      db.collections.resumeAiChat.insert({
        id: resumeId,
        userId,
        resumeId,
        messages: payload,
        createdAt: ts,
        updatedAt: ts,
      });
    },
    removeItem() {
      const db = options.getDb();
      if (db.collections.resumeAiChat.has(resumeId)) {
        db.collections.resumeAiChat.delete(resumeId);
      }
    },
  };
}
