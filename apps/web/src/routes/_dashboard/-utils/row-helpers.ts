import { uuidv7 } from "uuidv7";

export function nowMs() {
  return Date.now();
}

export function newId() {
  return uuidv7();
}

/** Shared fields for embeddable library rows. */
export function libraryRowBase(userId: string | undefined | null) {
  const ts = nowMs();
  return {
    id: newId(),
    userId: userId ?? null,
    sortOrder: 0,
    searchableText: "",
    embedding: null as number[] | null,
    embeddingModel: null as string | null,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function touchUpdatedAt() {
  return nowMs();
}

export function joinSearchable(...parts: Array<string | null | undefined>) {
  return parts
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(" ");
}
