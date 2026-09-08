import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useViewer } from "@/data-access-layer/auth/viewer";
import { APP_SETTINGS_ID, readAppSettings } from "@/data-access-layer/event-sourced/app-settings";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { useEventSourcedSyncStatus } from "@/data-access-layer/event-sourced/use-sync-status";
import { cn } from "@/lib/utils";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { Link } from "@tanstack/react-router";
import { CloudAlert, CloudCheck, RefreshCw, RefreshCwOff } from "lucide-react";

type SyncUiState = "disabled" | "syncing" | "error" | "synced";

function useManagedSyncUiState(): { state: SyncUiState; lastError: string | null } {
  const db = useEventSourcedDb();
  const { viewer } = useViewer();
  const isAuthenticated = Boolean(viewer.user?.id);
  const { isSyncing, lastError, failedCount, deadLetterCount } = useEventSourcedSyncStatus();

  readAppSettings(db);
  const { data } = useLiveQuery(
    (q) => q.from({ row: db.collections.settings }).where(({ row }) => eq(row.id, APP_SETTINGS_ID)),
    [],
  );
  const syncEnabled = Boolean(data?.[0]?.syncEnabled ?? readAppSettings(db).syncEnabled);
  const managedOn = isAuthenticated && syncEnabled && db.getSyncEnabled();

  if (!managedOn) return { state: "disabled", lastError };
  if (isSyncing) return { state: "syncing", lastError };
  if (lastError || failedCount > 0 || deadLetterCount > 0) return { state: "error", lastError };
  return { state: "synced", lastError };
}

const iconButtonClass = "text-muted-foreground size-7";

/**
 * Header control for managed sync — lives on the far right of the dashboard chrome.
 */
export function DashboardSyncStatusButton({ className }: { className?: string }) {
  const { state, lastError } = useManagedSyncUiState();

  if (state === "disabled") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(iconButtonClass, className)}
            asChild
            data-test="dashboard-sync-status"
            data-sync-state="disabled"
            aria-label="Sync disabled — open settings"
          >
            <Link to="/settings" hash="managed-sync">
              <RefreshCwOff className="size-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Sync disabled — open settings to enable</TooltipContent>
      </Tooltip>
    );
  }

  if (state === "syncing") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(iconButtonClass, className)}
            disabled
            data-test="dashboard-sync-status"
            data-sync-state="syncing"
            aria-label="Sync in progress"
          >
            <RefreshCw className="size-4 animate-spin" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Sync in progress</TooltipContent>
      </Tooltip>
    );
  }

  if (state === "error") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("text-destructive size-7", className)}
            asChild
            data-test="dashboard-sync-status"
            data-sync-state="error"
            aria-label="Sync error — view events"
          >
            <Link to="/events" search={{ tab: "deadletter" }}>
              <CloudAlert className="size-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {lastError ? `Sync error: ${lastError}` : "Sync issues — open events"}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("size-7 text-emerald-600 dark:text-emerald-400", className)}
          asChild
          data-test="dashboard-sync-status"
          data-sync-state="synced"
          aria-label="Synced"
        >
          <Link to="/events" search={{ tab: "outbox" }}>
            <CloudCheck className="size-4" />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Synced with managed server</TooltipContent>
    </Tooltip>
  );
}
