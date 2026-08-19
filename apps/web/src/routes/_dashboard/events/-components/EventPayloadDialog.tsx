import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { unwrapUnknownError } from "@/utils/errors";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatEventDate, type SyncEventView } from "./event-view";

type EventPayloadDialogProps = {
  event: SyncEventView;
  syncedLabel: string;
  pendingLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (eventId: string) => Promise<void>;
};

export function EventPayloadDialog({
  event,
  syncedLabel,
  pendingLabel,
  open,
  onOpenChange,
  onDelete,
}: EventPayloadDialogProps) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      await onDelete(event.eventId);
      onOpenChange(false);
      toast.success("Event deleted");
    } catch (err: unknown) {
      toast.error("Failed to delete event", {
        description: unwrapUnknownError(err).message,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-test="event-payload-dialog">
        <DialogHeader>
          <DialogTitle>Event payload</DialogTitle>
          <DialogDescription>
            {event.type} on {event.collectionId}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Event ID</dt>
          <dd className="font-mono text-xs break-all">{event.eventId}</dd>
          <dt className="text-muted-foreground">Key</dt>
          <dd className="font-mono text-xs break-all">{event.key}</dd>
          <dt className="text-muted-foreground">Global seq</dt>
          <dd>{event.globalSeq ?? "—"}</dd>
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <Badge variant={event.sync ? "secondary" : "outline"}>
              {event.sync ? syncedLabel : pendingLabel}
            </Badge>
          </dd>
          <dt className="text-muted-foreground">Time</dt>
          <dd>{formatEventDate(event.timestamp)}</dd>
        </dl>

        <pre className="bg-muted max-h-[45vh] overflow-auto rounded-md p-4 text-xs">
          {JSON.stringify(event.payload, null, 2)}
        </pre>

        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => void handleDelete()}
            data-test="event-payload-delete-btn"
          >
            {pending ? <Spinner /> : <Trash2 />}
            Delete event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
