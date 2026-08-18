/**
 * Exact-title reuse for library rows.
 * Resume association should point at this id (join table), not clone the row.
 */
export function findExistingByExactTitle<T>(
  collection: { toArray: readonly T[] },
  title: string,
  getTitle: (row: T) => string | null | undefined,
): T | undefined {
  const needle = normalizeTitle(title);
  if (!needle) return undefined;
  return collection.toArray.find((row) => normalizeTitle(getTitle(row) ?? "") === needle);
}

export function normalizeTitle(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
