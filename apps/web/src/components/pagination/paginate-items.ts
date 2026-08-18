import { ADMIN_LIST_PER_PAGE } from "./constants";

export type PaginatedSlice<T> = {
  items: T[];
  pagination: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
};

/**
 * Slice an already-materialized array into a page.
 *
 * Prefer `orderBy` + `limit` + `offset` on a TanStack DB live query when the
 * source is a collection. Use this only when the row set is not queryable
 * (e.g. a server-paginated DTO you already hold in memory).
 */
export function paginateItems<T>(
  rows: ReadonlyArray<T>,
  page = 1,
  perPage = ADMIN_LIST_PER_PAGE,
): PaginatedSlice<T> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePerPage =
    Number.isFinite(perPage) && perPage > 0 ? Math.floor(perPage) : ADMIN_LIST_PER_PAGE;
  const totalItems = rows.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / safePerPage);
  const clampedPage = totalPages === 0 ? 1 : Math.min(safePage, totalPages);
  const start = (clampedPage - 1) * safePerPage;

  return {
    items: rows.slice(start, start + safePerPage) as T[],
    pagination: {
      page: clampedPage,
      perPage: safePerPage,
      totalItems,
      totalPages,
    },
  };
}
