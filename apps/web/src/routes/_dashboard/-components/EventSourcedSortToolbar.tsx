import { TanstackDBSortSelect } from "@/lib/tanstack/db/TanstackDBColumnfilters";
import type { CollectionColumns, ColumnConfig } from "@/lib/tanstack/db/sortable-columns";
import type { Collection } from "@tanstack/db";
import { useNavigate, useSearch } from "@tanstack/react-router";

type EventSourcedSortToolbarProps<
  TCollection extends Collection<any, any>,
  TColumns extends CollectionColumns<TCollection> = CollectionColumns<TCollection>,
> = {
  collection: TCollection;
  sortableColumns: Array<ColumnConfig<TColumns>>;
  defaultSortBy?: TColumns;
  defaultSortDirection?: "asc" | "desc";
};

/**
 * Compact TanStack DB sort control for list scaffolds (URL `sortBy` / `sortDirection`).
 */
export function EventSourcedSortToolbar<
  TCollection extends Collection<any, any>,
  TColumns extends CollectionColumns<TCollection> = CollectionColumns<TCollection>,
>({
  collection,
  sortableColumns,
  defaultSortBy,
  defaultSortDirection = "desc",
}: EventSourcedSortToolbarProps<TCollection, TColumns>) {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const sortBy = typeof search.sortBy === "string" ? search.sortBy : undefined;
  const sortDirection =
    search.sortDirection === "asc" || search.sortDirection === "desc"
      ? search.sortDirection
      : undefined;

  return (
    <TanstackDBSortSelect
      collection={collection}
      sortableColumns={sortableColumns}
      search={{ sortBy, sortDirection }}
      navigate={navigate}
      defaultSortBy={defaultSortBy}
      defaultSortDirection={defaultSortDirection}
    />
  );
}
