import { ADMIN_LIST_PER_PAGE } from "@/components/pagination/constants";
import { ilike, or } from "@tanstack/db";

type IlikeField = Parameters<typeof ilike>[0];

export function keywordPattern(q: string) {
  return `%${q.trim()}%`;
}

/**
 * Case-insensitive OR across query field refs. Empty `q` must be skipped
 * by the caller — do not call this for an unfiltered list.
 */
export function orIlike(q: string, first: IlikeField, second: IlikeField, ...rest: IlikeField[]) {
  const pattern = keywordPattern(q);
  return or(
    ilike(first, pattern),
    ilike(second, pattern),
    ...rest.map((field) => ilike(field, pattern)),
  );
}

export function listOffset(page: number, perPage = ADMIN_LIST_PER_PAGE) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  return (safePage - 1) * perPage;
}

export function totalPagesFromCount(totalItems: number, perPage = ADMIN_LIST_PER_PAGE) {
  if (totalItems <= 0) return 0;
  return Math.ceil(totalItems / perPage);
}
