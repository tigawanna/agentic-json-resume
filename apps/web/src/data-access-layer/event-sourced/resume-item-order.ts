import { nowMs } from "@/routes/event-sourced/-utils/row-helpers";
import type { AppDb } from "./collection";
import type { Resume } from "./schemas";

export type ResumeItemOrderField = keyof Pick<
  Resume,
  "experienceOrder" | "educationOrder" | "projectOrder" | "talkOrder"
>;

export const emptyResumeItemOrder = {
  experienceOrder: [] as string[],
  educationOrder: [] as string[],
  projectOrder: [] as string[],
  talkOrder: [] as string[],
};

type JunctionRow = {
  id: string;
  resumeId: string;
  sortOrder: number;
};

export function itemsInResumeOrder<TItem extends { resumeId: string; sortOrder: number }>(
  resumeId: string,
  items: TItem[],
  order: string[] | undefined,
  entityId: (item: TItem) => string,
): TItem[] {
  const forResume = items.filter((item) => item.resumeId === resumeId);
  const byEntity = new Map(forResume.map((item) => [entityId(item), item]));
  const fallback = forResume.slice().sort((a, b) => a.sortOrder - b.sortOrder);

  if (!order || order.length === 0) return fallback;

  const used = new Set<string>();
  const ordered: TItem[] = [];
  for (const id of order) {
    const item = byEntity.get(id);
    if (!item) continue;
    ordered.push(item);
    used.add(id);
  }
  const rest = fallback.filter((item) => !used.has(entityId(item)));
  return [...ordered, ...rest];
}

export function junctionEntityIds<T extends JunctionRow>(
  items: T[],
  resumeId: string,
  entityKey: keyof T & string,
): string[] {
  return items
    .filter((item) => item.resumeId === resumeId)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => String(item[entityKey]));
}

export function appendResumeItemOrder(
  db: AppDb,
  resumeId: string,
  field: ResumeItemOrderField,
  entityId: string,
  existingIds: string[],
) {
  db.collections.resume.update(resumeId, (draft) => {
    const stored = draft[field];
    const current = stored && stored.length > 0 ? [...stored] : [...existingIds];
    if (!current.includes(entityId)) current.push(entityId);
    draft[field] = current;
    draft.updatedAt = nowMs();
  });
}

export function removeResumeItemOrder(
  db: AppDb,
  resumeId: string,
  field: ResumeItemOrderField,
  entityId: string,
) {
  db.collections.resume.update(resumeId, (draft) => {
    draft[field] = (draft[field] ?? []).filter((id) => id !== entityId);
    draft.updatedAt = nowMs();
  });
}

export function reorderResumeItems<T extends JunctionRow>(
  db: AppDb,
  resumeId: string,
  field: ResumeItemOrderField,
  idA: string,
  idB: string,
  items: T[],
  entityKey: keyof T & string,
  junction: {
    update: (
      id: string,
      updater: (draft: { sortOrder: number; updatedAt: number }) => void,
    ) => void;
  },
) {
  const fallback = junctionEntityIds(items, resumeId, entityKey);
  let next: string[] = [];

  db.collections.resume.update(resumeId, (draft) => {
    const stored = draft[field];
    const current = stored && stored.length > 0 ? [...stored] : [...fallback];
    for (const id of fallback) {
      if (!current.includes(id)) current.push(id);
    }
    const i = current.indexOf(idA);
    const j = current.indexOf(idB);
    if (i !== -1 && j !== -1) {
      const left = current[i];
      const right = current[j];
      if (left !== undefined && right !== undefined) {
        current[i] = right;
        current[j] = left;
      }
    }
    draft[field] = current;
    draft.updatedAt = nowMs();
    next = current;
  });

  next.forEach((entityId, index) => {
    const item = items.find(
      (row) => row.resumeId === resumeId && String(row[entityKey]) === entityId,
    );
    if (!item) return;
    junction.update(item.id, (draft) => {
      draft.sortOrder = index;
      draft.updatedAt = nowMs();
    });
  });
}
