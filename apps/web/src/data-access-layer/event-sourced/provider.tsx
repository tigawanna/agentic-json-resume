import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useViewer } from "@/data-access-layer/auth/viewer";
import { applyManagedSyncGate } from "./app-settings";
import { db as dbProxy, ensureDb, type AppDb } from "./collection";

declare global {
  interface Window {
    /** Playwright-only handle to the in-browser event-sourced DB. */
    __e2eEventSourcedDb?: AppDb;
  }
}

type EventSourcedDbContextValue = {
  db: AppDb;
};

const EventSourcedDbContext = createContext<EventSourcedDbContextValue | null>(null);

type EventSourcedDbProviderProps = {
  children: ReactNode;
  /** Shown while OPFS SQLite is opening. Defaults to a minimal loading shell. */
  fallback?: ReactNode;
  /** Shown when `ensureDb()` rejects. Receives the thrown error. */
  errorFallback?: (error: Error) => ReactNode;
};

/**
 * Opens the event-sourced DB once for a subtree, then exposes it via {@link useDb}.
 * Safe under SSR: `ensureDb` only runs in `useEffect` (browser).
 *
 * @example
 * ```tsx
 * <EventSourcedDbProvider>
 *   <ResumeEditor />
 * </EventSourcedDbProvider>
 *
 * function ResumeEditor() {
 *   const db = useEventSourcedDb();
 *   // db.collections.resume.insert(...)
 * }
 * ```
 */
export function EventSourcedDbProvider({
  children,
  fallback,
  errorFallback,
}: EventSourcedDbProviderProps) {
  const { viewer } = useViewer();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isAuthenticated = Boolean(viewer.user?.id);

  useEffect(() => {
    let cancelled = false;

    ensureDb()
      .then(() => {
        if (cancelled) return;
        applyManagedSyncGate(dbProxy, isAuthenticated);
        if (import.meta.env.DEV || import.meta.env.VITE_E2E === "true") {
          window.__e2eEventSourcedDb = dbProxy;
        }
        setReady(true);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setReady(false);
        setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (error) {
    if (errorFallback) {
      return errorFallback(error);
    }
    throw error;
  }

  if (!ready) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        {fallback ?? (
          <div data-test="event-sourced-db-loading" className="text-base-content/60 p-4 text-sm">
            Opening local database…
          </div>
        )}
      </div>
    );
  }

  return <EventSourcedDbContext value={{ db: dbProxy }}>{children}</EventSourcedDbContext>;
}

/**
 * Resolved event-sourced DB for the nearest {@link EventSourcedDbProvider}.
 * Throws if used outside the provider or before init finishes (children only
 * render after ready).
 */
export function useEventSourcedDb(): AppDb {
  const ctx = useContext(EventSourcedDbContext);
  if (!ctx) {
    throw new Error("useDb must be used within EventSourcedDbProvider");
  }
  return ctx.db;
}
