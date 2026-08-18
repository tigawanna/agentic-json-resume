import { ADMIN_LIST_PER_PAGE } from "@/components/pagination/constants";
import { usePageSearchQuery } from "@/components/search/use-page-search-query";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { RouterPendingComponent } from "@/lib/tanstack/router/RouterPendingComponent";
import { unwrapUnknownError } from "@/utils/errors";
import { count, useLiveQuery } from "@tanstack/react-db";
import { Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LibraryEmpty } from "../../-components/LibraryEmpty";
import { ResponsiveEntityTable } from "../../-components/ResponsiveEntityTable";
import { listOffset, orIlike, totalPagesFromCount } from "../../-utils/list-query";
import { Route } from "..";
import { EventPayloadDialog } from "./EventPayloadDialog";
import { EventQueueRowActions, eventQueueColumns } from "./event-queue-table";
import { toEventView, type SyncEventView } from "./event-view";

const ROUTE_ID = "/event-sourced/events/" as const;

type InboxListProps = {
  onTotalPages: (totalPages: number) => void;
};

export function InboxList({ onTotalPages }: InboxListProps) {
  const db = useEventSourcedDb();
  const { page = 1, q = "" } = Route.useSearch();
  const { clearSearch } = usePageSearchQuery(ROUTE_ID);
  const [inspecting, setInspecting] = useState<SyncEventView | null>(null);

  const keyword = q.trim();
  const offset = listOffset(page);

  const { data: items, isLoading } = useLiveQuery(
    (query) => {
      const base = query.from({ row: db.collections.inbox });
      const filtered = keyword
        ? base.where(({ row }) => orIlike(keyword, row.collectionId, row.type, row.eventId))
        : base;
      return filtered
        .orderBy(({ row }) => row.globalSeq, "desc")
        .limit(ADMIN_LIST_PER_PAGE)
        .offset(offset);
    },
    [keyword, offset],
  );

  const { data: totals } = useLiveQuery(
    (query) => {
      const base = query.from({ row: db.collections.inbox });
      const filtered = keyword
        ? base.where(({ row }) => orIlike(keyword, row.collectionId, row.type, row.eventId))
        : base;
      return filtered.select(({ row }) => ({ total: count(row.eventId) }));
    },
    [keyword],
  );

  const rows = (items ?? []).map(toEventView);
  const totalPages = totalPagesFromCount(totals?.[0]?.total ?? 0);

  useEffect(() => {
    onTotalPages(totalPages);
  }, [onTotalPages, totalPages]);

  async function handleDelete(eventId: string) {
    await db.collections.inbox.delete(eventId).isPersisted.promise;
  }

  if (isLoading) return <RouterPendingComponent />;

  if (rows.length === 0) {
    return (
      <LibraryEmpty
        icon={Inbox}
        title="Inbox is empty"
        description="Events received from the server will appear here once you sync."
        hasSearch={keyword.length > 0}
        onClearSearch={clearSearch}
        dataTest="inbox-empty"
      />
    );
  }

  return (
    <>
      <ResponsiveEntityTable
        rows={rows}
        columns={eventQueueColumns("Applied", "Pending")}
        mobileTitle={(row) => row.collectionId}
        mobileSubtitle={(row) => row.type}
        dataTest="inbox-table"
        actions={(row) => (
          <EventQueueRowActions
            onInspect={() => setInspecting(row)}
            onDelete={() => {
              void handleDelete(row.eventId).catch((err: unknown) => {
                toast.error("Failed to delete event", {
                  description: unwrapUnknownError(err).message,
                });
              });
            }}
          />
        )}
      />
      {inspecting ? (
        <EventPayloadDialog
          event={inspecting}
          syncedLabel="Applied"
          pendingLabel="Pending"
          open
          onOpenChange={(open) => {
            if (!open) setInspecting(null);
          }}
          onDelete={handleDelete}
        />
      ) : null}
    </>
  );
}
