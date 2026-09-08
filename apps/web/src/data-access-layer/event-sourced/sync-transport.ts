import type { PullResponse, PushResponse, SyncTransport } from "event-sourced-collection";

const SYNC_URL = "/api/sync/events";

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text) as unknown;
}

/**
 * Cookie-session transport. Push/pull never run unless the DB has sync enabled;
 * the server still 401s if there is no session.
 */
export function createCookieSyncTransport(): SyncTransport {
  return {
    async push(events) {
      // console.log("push === ", events);
      const response = await fetch(SYNC_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(events),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Sync push failed (${response.status}): ${body}`);
      }
      return (await readJson(response)) as PushResponse;
    },
    async pull(since) {
      // console.log("pull === ", since);
      const url = `${SYNC_URL}?since=${encodeURIComponent(String(since))}`;
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Sync pull failed (${response.status}): ${body}`);
      }
      return (await readJson(response)) as PullResponse;
    },
  };
}
