import { ADMIN_LIST_PER_PAGE } from "@/components/pagination/constants";
import { usePageSearchQuery } from "@/components/search/use-page-search-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import type { ResumeLanguage } from "@/data-access-layer/event-sourced/schemas";
import { RouterPendingComponent } from "@/lib/tanstack/router/RouterPendingComponent";
import { count, useLiveQuery } from "@tanstack/react-db";
import { Globe, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EventSourcedListScaffold } from "../../-components/EventSourcedListScaffold";
import { ImportFromLegacyButton } from "../../-components/ImportFromLegacyButton";
import { LibraryEmpty } from "../../-components/LibraryEmpty";
import {
  ResponsiveEntityTable,
  type ResponsiveColumn,
} from "../../-components/ResponsiveEntityTable";
import { RowActionButtons } from "../../-components/RowActionButtons";
import { listOffset, orIlike, totalPagesFromCount } from "../../-utils/list-query";
import { unwrapUnknownError } from "@/utils/errors";
import { Route } from "..";
import { LanguageCreateForm, LanguageCreateFormDialog } from "./LanguageCreateForm";
import { LanguageEditForm } from "./LanguageEditForm";

const ROUTE_ID = "/event-sourced/languages/" as const;

const columns: ResponsiveColumn<ResumeLanguage>[] = [
  {
    id: "name",
    header: "Language",
    cell: (row) => row.name || "—",
  },
  {
    id: "proficiency",
    header: "Proficiency",
    cell: (row) => row.proficiency || "—",
  },
];

export function LanguageList() {
  const db = useEventSourcedDb();
  const { page = 1, q = "" } = Route.useSearch();
  const { clearSearch } = usePageSearchQuery(ROUTE_ID);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ResumeLanguage | null>(null);

  const keyword = q.trim();
  const offset = listOffset(page);

  const { data: items, isLoading } = useLiveQuery(
    (query) => {
      const base = query.from({ row: db.collections.resumeLanguage });
      const filtered = keyword
        ? base.where(({ row }) => orIlike(keyword, row.name, row.proficiency, row.searchableText))
        : base;
      return filtered
        .orderBy(({ row }) => row.updatedAt, "desc")
        .limit(ADMIN_LIST_PER_PAGE)
        .offset(offset);
    },
    [keyword, offset],
  );

  const { data: totals } = useLiveQuery(
    (query) => {
      const base = query.from({ row: db.collections.resumeLanguage });
      const filtered = keyword
        ? base.where(({ row }) => orIlike(keyword, row.name, row.proficiency, row.searchableText))
        : base;
      return filtered.select(({ row }) => ({ total: count(row.id) }));
    },
    [keyword],
  );

  const totalItems = totals?.[0]?.total ?? 0;
  const totalPages = totalPagesFromCount(totalItems);
  const hasSearch = keyword.length > 0;

  function handleDelete(id: string) {
    try {
      db.collections.resumeLanguage.delete(id);
      toast.success("Language deleted");
    } catch (err: unknown) {
      toast.error("Failed to delete", { description: unwrapUnknownError(err).message });
    }
  }

  const actions = (
    <>
      <ImportFromLegacyButton importer="languages" />
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCreateOpen(true)}
        data-test="add-languages-btn"
      >
        <Plus className="mr-1 size-4" /> Add
      </Button>
    </>
  );

  if (isLoading) {
    return (
      <EventSourcedListScaffold
        routeID={ROUTE_ID}
        title="Languages"
        description="Languages in your local library (not yet attached to a résumé)."
        searchPlaceholder="Search languages…"
        actions={actions}
        dataTest="languages-list-page"
      >
        <RouterPendingComponent />
      </EventSourcedListScaffold>
    );
  }

  if (items.length === 0) {
    return (
      <EventSourcedListScaffold
        routeID={ROUTE_ID}
        title="Languages"
        description="Languages in your local library (not yet attached to a résumé)."
        searchPlaceholder="Search languages…"
        totalPages={0}
        actions={actions}
        dataTest="languages-list-page"
      >
        <LibraryEmpty
          icon={Globe}
          title="No Languages Yet"
          description="You haven't added any languages yet. Create your first entry to get started."
          actionLabel="Create Language"
          onAction={() => setCreateOpen(true)}
          hasSearch={hasSearch}
          onClearSearch={clearSearch}
          dataTest="languages-empty"
        />
        <LanguageCreateFormDialog open={createOpen} setOpen={setCreateOpen} />
      </EventSourcedListScaffold>
    );
  }

  return (
    <EventSourcedListScaffold
      routeID={ROUTE_ID}
      title="Languages"
      description="Languages in your local library (not yet attached to a résumé)."
      searchPlaceholder="Search languages…"
      totalPages={totalPages}
      actions={actions}
      dataTest="languages-list-page"
    >
      <ResponsiveEntityTable
        rows={items}
        columns={columns}
        mobileTitle={(row) => row.name}
        mobileSubtitle={(row) => row.proficiency || undefined}
        dataTest="languages-table"
        actions={(row) => (
          <RowActionButtons onEdit={() => setEditing(row)} onDelete={() => handleDelete(row.id)} />
        )}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Language</DialogTitle>
          </DialogHeader>
          <LanguageCreateForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Language</DialogTitle>
          </DialogHeader>
          {editing ? <LanguageEditForm item={editing} onSuccess={() => setEditing(null)} /> : null}
        </DialogContent>
      </Dialog>
    </EventSourcedListScaffold>
  );
}
