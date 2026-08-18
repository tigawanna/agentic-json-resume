import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ResponsiveColumn } from "../../-components/ResponsiveEntityTable";
import { Eye, Trash2 } from "lucide-react";
import { formatEventDate, type SyncEventView } from "./event-view";

export function EventTypeBadge({ type }: { type: SyncEventView["type"] }) {
  if (type === "insert") {
    return (
      <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
        Insert
      </Badge>
    );
  }
  if (type === "update") {
    return (
      <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300">
        Update
      </Badge>
    );
  }
  return (
    <Badge className="border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-300">
      Delete
    </Badge>
  );
}

export function SyncStatusBadge({
  sync,
  syncedLabel,
  pendingLabel,
}: {
  sync: boolean;
  syncedLabel: string;
  pendingLabel: string;
}) {
  if (sync) {
    return (
      <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
        {syncedLabel}
      </Badge>
    );
  }
  return (
    <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300">
      {pendingLabel}
    </Badge>
  );
}

export function eventQueueColumns(
  syncedLabel: string,
  pendingLabel: string,
): ResponsiveColumn<SyncEventView>[] {
  return [
    {
      id: "type",
      header: "Type",
      cell: (row) => <EventTypeBadge type={row.type} />,
    },
    {
      id: "collection",
      header: "Collection",
      cell: (row) => <span className="font-medium">{row.collectionId}</span>,
    },
    {
      id: "key",
      header: "Key",
      cell: (row) => <span className="font-mono text-xs">{row.key}</span>,
    },
    {
      id: "seq",
      header: "Seq",
      cell: (row) => row.globalSeq ?? "—",
      hideOnMobile: true,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <SyncStatusBadge sync={row.sync} syncedLabel={syncedLabel} pendingLabel={pendingLabel} />
      ),
    },
    {
      id: "time",
      header: "Time",
      cell: (row) => (
        <span className="text-muted-foreground">{formatEventDate(row.timestamp)}</span>
      ),
    },
  ];
}

export function EventQueueRowActions({
  onInspect,
  onDelete,
}: {
  onInspect: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={onInspect}
        data-test="event-inspect-btn"
        aria-label="Inspect event"
      >
        <Eye className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive size-8"
        onClick={onDelete}
        data-test="event-delete-btn"
        aria-label="Delete event"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
