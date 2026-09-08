import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useViewer } from "@/data-access-layer/auth/viewer";
import {
  applyManagedSyncGate,
  readAppSettings,
  setManagedSyncEnabled,
} from "@/data-access-layer/event-sourced/app-settings";
import {
  EventSourcedDbProvider,
  useEventSourcedDb,
} from "@/data-access-layer/event-sourced/provider";
import { useEventSourcedSyncStatus } from "@/data-access-layer/event-sourced/use-sync-status";
import { unwrapUnknownError } from "@/utils/errors";
import { Link } from "@tanstack/react-router";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function ManagedSyncControls() {
  const db = useEventSourcedDb();
  const { isSyncing } = useEventSourcedSyncStatus();
  const { viewer } = useViewer();
  const isAuthenticated = Boolean(viewer.user?.id);
  const [settings, setSettings] = useState(() => applyManagedSyncGate(db, isAuthenticated));

  function handleToggle(enabled: boolean) {
    if (enabled && !isAuthenticated) {
      toast.error("Sign in to sync with the managed server");
      return;
    }
    try {
      const next = setManagedSyncEnabled(db, enabled, isAuthenticated);
      setSettings(next);
      toast.success(enabled ? "Managed sync on" : "Managed sync off");
    } catch (err: unknown) {
      toast.error("Could not update sync setting", {
        description: unwrapUnknownError(err).message,
      });
    }
  }

  async function handleSyncNow() {
    if (!isAuthenticated) {
      toast.error("Sign in to sync");
      return;
    }
    if (!readAppSettings(db).syncEnabled) {
      toast.error("Turn on managed sync first");
      return;
    }
    try {
      applyManagedSyncGate(db, true);
      if (!db.getSyncEnabled()) {
        toast.error("Sync is still disabled", {
          description: "Turn on managed sync and stay signed in, then try again.",
        });
        return;
      }
      const result = await db.manualSync();
      // manualSync does not throw on transport/server failures — check the result.
      if (result.deferred) {
        toast.error("Sync skipped", {
          description: "Another tab is already syncing. Close it or try again.",
        });
        return;
      }
      if (result.errors.length > 0) {
        toast.error("Sync failed", {
          description: result.errors.map((e) => e.message).join("; "),
        });
        return;
      }
      toast.success("Sync finished", {
        description: `Pushed ${result.pushed}, pulled ${result.pulled}`,
      });
    } catch (err: unknown) {
      toast.error("Sync failed", { description: unwrapUnknownError(err).message });
    }
  }

  return (
    <Card data-test="managed-sync-section">
      <CardHeader>
        <CardTitle>Managed sync</CardTitle>
        <CardDescription>
          Keep working only in this browser, or push the outbox to our servers after you sign in.
          The server stamps your user id; local rows are not rewritten.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="managed-sync-toggle" className="text-sm font-medium">
            Sync with managed server
          </Label>
          <Switch
            id="managed-sync-toggle"
            checked={settings.syncEnabled}
            onCheckedChange={handleToggle}
            disabled={!isAuthenticated}
            data-test="managed-sync-toggle"
          />
        </div>
        {!isAuthenticated ? (
          <p className="text-muted-foreground text-sm">
            Sign in to turn this on and push your local outbox to the server.{" "}
            <Link
              to="/auth"
              search={{ returnTo: "/settings" }}
              className="text-primary font-medium underline-offset-4 hover:underline"
              data-test="managed-sync-signin"
            >
              Sign in to sync
            </Link>
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          disabled={!isAuthenticated || !settings.syncEnabled || isSyncing}
          onClick={() => void handleSyncNow()}
          data-test="managed-sync-now-btn"
        >
          {isSyncing ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 size-4" />
          )}
          {isSyncing ? "Syncing…" : "Sync now"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ManagedSyncSection() {
  return (
    <EventSourcedDbProvider
      fallback={
        <Card>
          <CardHeader>
            <CardTitle>Managed sync</CardTitle>
            <CardDescription>Opening the local database…</CardDescription>
          </CardHeader>
        </Card>
      }
    >
      <ManagedSyncControls />
    </EventSourcedDbProvider>
  );
}
