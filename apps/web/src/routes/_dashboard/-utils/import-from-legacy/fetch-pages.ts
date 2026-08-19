import type { PaginatedResult } from "@/data-access-layer/pagination.types";

const MAX_PAGES = 200;

export async function fetchAllCursorPages<T>(
  label: string,
  fetchPage: (cursor: string | undefined) => Promise<PaginatedResult<T>>,
): Promise<T[]> {
  const items: T[] = [];
  let cursor: string | undefined;
  let pages = 0;
  const seenCursors = new Set<string>();

  while (pages < MAX_PAGES) {
    pages += 1;
    let page: PaginatedResult<T>;
    try {
      page = await fetchPage(cursor);
    } catch (err: unknown) {
      console.error(`[import ${label}] fetch page failed`, { cursor, page: pages }, err);
      throw err;
    }

    items.push(...page.items);

    if (!page.nextCursor) break;
    if (seenCursors.has(page.nextCursor)) {
      console.warn(`[import ${label}] repeated nextCursor, stopping pagination`, page.nextCursor);
      break;
    }
    seenCursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }

  if (pages >= MAX_PAGES) {
    console.warn(
      `[import ${label}] hit ${MAX_PAGES} page cap; imported ${items.length} rows so far`,
    );
  }

  return items;
}

export function isoToMs(label: string, iso: string, id: string): number {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    console.warn(`[import ${label}] invalid timestamp, using now`, { id, iso });
    return Date.now();
  }
  return ms;
}

export type ImportStats = {
  fetched: number;
  inserted: number;
  skipped: number;
  failed: number;
};

export function emptyStats(fetched = 0): ImportStats {
  return { fetched, inserted: 0, skipped: 0, failed: 0 };
}

export function logImportSummary(label: string, stats: ImportStats) {
  const line = `[import ${label}] fetched=${stats.fetched} inserted=${stats.inserted} skipped=${stats.skipped} failed=${stats.failed}`;
  if (stats.failed > 0) {
    console.error(line);
  } else if (stats.skipped > 0) {
    console.warn(line);
  } else {
    console.info(line);
  }
}

export function formatImportToast(noun: string, stats: ImportStats): string {
  const parts = [`Imported ${stats.inserted} ${noun}`];
  if (stats.skipped > 0) parts.push(`${stats.skipped} skipped`);
  if (stats.failed > 0) parts.push(`${stats.failed} failed`);
  return parts.join(" · ");
}
