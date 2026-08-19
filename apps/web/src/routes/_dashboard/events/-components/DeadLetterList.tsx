import { ADMIN_LIST_PER_PAGE } from "@/components/pagination/constants";
import { usePageSearchQuery } from "@/components/search/use-page-search-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { RouterPendingComponent } from "@/lib/tanstack/router/RouterPendingComponent";
import { unwrapUnknownError } from "@/utils/errors";
import type { DeadLetterEntry } from "event-sourced-collection";
import { count, useLiveQuery } from "@tanstack/react-db";
import { Inbox, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LibraryEmpty } from "../../-components/LibraryEmpty";
import {
  ResponsiveEntityTable,
  type ResponsiveColumn,
} from "../../-components/ResponsiveEntityTable";
import {
  listOffset,
  listOrderByRef,
  listSortDirection,
  orIlike,
  totalPagesFromCount,
} from "../../-utils/list-query";
import { Route } from "..";
import { EventTypeBadge } from "./event-queue-table";
import { formatEventDate } from "./event-view";

const ROUTE_ID = "/_dashboard/events/" as const;

type DeadLetterRow = DeadLetterEntry & { id: string };

const columns: ResponsiveColumn<DeadLetterRow>[] = [
  {
    id: "collection",
    header: "Collection",
    sortKey: "collectionId",
    cell: (row) => <span className="font-medium">{row.collectionId}</span>,
  },
  {
    id: "key",
    header: "Key",
    cell: (row) => <span className="font-mono text-xs">{String(row.key)}</span>,
  },
  {
    id: "type",
    header: "Type",
    cell: (row) => <EventTypeBadge type={row.type} />,
    hideOnMobile: true,
  },
  {
    id: "reason",
    header: "Reason",
    cell: (row) => (
      <div className="flex min-w-0 flex-col gap-1">
        <Badge variant="outline">{row.reason}</Badge>
        <span className="text-muted-foreground line-clamp-2 whitespace-normal text-xs">
          {row.message}
        </span>
      </div>
    ),
  },
  {
    id: "failed",
    header: "Failed",
    sortKey: "failedAt",
    cell: (row) => <span className="text-muted-foreground">{formatEventDate(row.failedAt)}</span>,
  },
];

type DeadLetterListProps = {
  onTotalPages: (totalPages: number) => void;
};

export function DeadLetterList({ onTotalPages }: DeadLetterListProps) {
  const db = useEventSourcedDb();
  const { page = 1, q = "", sortBy, sortDirection } = Route.useSearch();
  const { clearSearch } = usePageSearchQuery(ROUTE_ID);
  const [busyId, setBusyId] = useState<string | null>(null);

  const keyword = q.trim();
  const offset = listOffset(page);
  const sortDir = listSortDirection(sortDirection);

  const { data: items, isLoading } = useLiveQuery(
    (query) => {
      const base = query.from({ row: db.collections.deadletter });
      const filtered = keyword
        ? base.where(({ row }) =>
            orIlike(keyword, row.collectionId, row.type, row.eventId, row.reason, row.message),
          )
        : base;
      return filtered
        .orderBy(({ row }) => listOrderByRef(row, sortBy, "failedAt"), sortDir)
        .limit(ADMIN_LIST_PER_PAGE)
        .offset(offset);
    },
    [keyword, offset, sortBy, sortDir],
  );

  const { data: totals } = useLiveQuery(
    (query) => {
      const base = query.from({ row: db.collections.deadletter });
      const filtered = keyword
        ? base.where(({ row }) =>
            orIlike(keyword, row.collectionId, row.type, row.eventId, row.reason, row.message),
          )
        : base;
      return filtered.select(({ row }) => ({ total: count(row.eventId) }));
    },
    [keyword],
  );

  const rows: DeadLetterRow[] = (items ?? []).map((row) => ({ ...row, id: row.eventId }));
  const totalPages = totalPagesFromCount(totals?.[0]?.total ?? 0);

  useEffect(() => {
    onTotalPages(totalPages);
  }, [onTotalPages, totalPages]);

  async function retryOne(eventId: string) {
    setBusyId(eventId);
    try {
      const countRetried = await db.retryDeadLetter(eventId);
      toast.success(countRetried > 0 ? "Requeued for sync" : "Nothing to retry");
    } catch (err: unknown) {
      toast.error("Retry failed", { description: unwrapUnknownError(err).message });
    } finally {
      setBusyId(null);
    }
  }

  async function discardOne(eventId: string) {
    setBusyId(eventId);
    try {
      const discarded = await db.discardDeadLetter(eventId);
      toast.success(discarded > 0 ? "Discarded dead-letter event" : "Nothing to discard");
    } catch (err: unknown) {
      toast.error("Discard failed", { description: unwrapUnknownError(err).message });
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) return <RouterPendingComponent />;

  if (rows.length === 0) {
    return (
      <LibraryEmpty
        icon={Inbox}
        title="Dead letter is empty"
        description="Permanently rejected events and exhausted retries appear here. Retry to send them through the outbox again, or discard to drop them."
        hasSearch={keyword.length > 0}
        onClearSearch={clearSearch}
        dataTest="deadletter-empty"
      />
    );
  }

  return (
    <ResponsiveEntityTable
      rows={rows}
      columns={columns}
      mobileTitle={(row) => row.collectionId}
      mobileSubtitle={(row) => row.reason}
      dataTest="deadletter-table"
      defaultSortBy="failedAt"
      actions={(row) => {
        const busy = busyId === row.eventId || busyId === "*";
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void retryOne(row.eventId)}
              data-test="deadletter-retry-btn"
            >
              {busyId === row.eventId ? (
                <Spinner className="size-3.5" />
              ) : (
                <RotateCcw className="size-3.5" />
              )}
              Retry
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={() => void discardOne(row.eventId)}
              data-test="deadletter-discard-btn"
            >
              <Trash2 className="size-3.5" />
              Discard
            </Button>
          </div>
        );
      }}
    />
  );
}

export function DeadLetterRetryAllButton() {
  const db = useEventSourcedDb();
  const [pending, setPending] = useState(false);

  async function retryAll() {
    setPending(true);
    try {
      const retried = await db.retryDeadLetter();
      toast.success(retried > 0 ? `Requeued ${retried} event(s)` : "Dead letter is empty");
    } catch (err: unknown) {
      toast.error("Retry all failed", { description: unwrapUnknownError(err).message });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => void retryAll()}
      data-test="deadletter-retry-all-btn"
    >
      {pending ? <Spinner className="size-4" /> : <RotateCcw className="size-4" />}
      Retry all
    </Button>
  );
}
