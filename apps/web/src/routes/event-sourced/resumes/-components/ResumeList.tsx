import { ADMIN_LIST_PER_PAGE } from "@/components/pagination/constants";
import { usePageSearchQuery } from "@/components/search/use-page-search-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import type { Resume } from "@/data-access-layer/event-sourced/schemas";
import { RouterPendingComponent } from "@/lib/tanstack/router/RouterPendingComponent";
import { formatLocaleDate } from "@/utils/date-helpers";
import { unwrapUnknownError } from "@/utils/errors";
import { dashIfEmpty } from "@/utils/string";
import { count, useLiveQuery } from "@tanstack/react-db";
import { useNavigate } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EventSourcedListScaffold } from "../../-components/EventSourcedListScaffold";
import { ImportFromLegacyButton } from "../../-components/ImportFromLegacyButton";
import { LibraryEmpty } from "../../-components/LibraryEmpty";
import { ResponsiveEntityTable } from "../../-components/ResponsiveEntityTable";
import { RowActionButtons } from "../../-components/RowActionButtons";
import { listOffset, orIlike, totalPagesFromCount } from "../../-utils/list-query";
import { ResumeCreateForm, ResumeCreateFormDialog } from "./ResumeCreateForm";
import { ResumeEditForm } from "./ResumeEditForm";
import { Route } from "..";

const ROUTE_ID = "/event-sourced/resumes/" as const;

export function ResumeList() {
  const db = useEventSourcedDb();
  const navigate = useNavigate();
  const { page = 1, q = "" } = Route.useSearch();
  const { clearSearch } = usePageSearchQuery(ROUTE_ID);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Resume | null>(null);

  const keyword = q.trim();
  const offset = listOffset(page);

  const { data: items, isLoading } = useLiveQuery(
    (query) => {
      const base = query.from({ row: db.collections.resume });
      const filtered = keyword
        ? base.where(({ row }) =>
            orIlike(
              keyword,
              row.name,
              row.fullName,
              row.headline,
              row.description,
              row.searchableText,
            ),
          )
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
      const base = query.from({ row: db.collections.resume });
      const filtered = keyword
        ? base.where(({ row }) =>
            orIlike(
              keyword,
              row.name,
              row.fullName,
              row.headline,
              row.description,
              row.searchableText,
            ),
          )
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
      db.collections.resume.delete(id);
      toast.success("Résumé deleted");
    } catch (err: unknown) {
      toast.error("Failed to delete", { description: unwrapUnknownError(err).message });
    }
  }

  const actions = (
    <>
      <ImportFromLegacyButton importer="resumes" />
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCreateOpen(true)}
        data-test="add-resumes-btn"
      >
        <Plus className="mr-1 size-4" /> Add
      </Button>
    </>
  );

  if (isLoading) {
    return (
      <EventSourcedListScaffold
        routeID={ROUTE_ID}
        title="Résumés"
        description="Local-first résumés stored in your event-sourced collection."
        searchPlaceholder="Search résumés…"
        actions={actions}
        dataTest="resumes-list-page"
      >
        <RouterPendingComponent />
      </EventSourcedListScaffold>
    );
  }

  if (items.length === 0) {
    return (
      <EventSourcedListScaffold
        routeID={ROUTE_ID}
        title="Résumés"
        description="Local-first résumés stored in your event-sourced collection."
        searchPlaceholder="Search résumés…"
        totalPages={0}
        actions={actions}
        dataTest="resumes-list-page"
      >
        <LibraryEmpty
          icon={FileText}
          title="No Résumés Yet"
          description="Create a résumé shell locally. Section library items (experience, education, …) live under Resume Data."
          actionLabel="Create Résumé"
          onAction={() => setCreateOpen(true)}
          hasSearch={hasSearch}
          onClearSearch={clearSearch}
          dataTest="resumes-empty"
        />
        <ResumeCreateFormDialog open={createOpen} setOpen={setCreateOpen} />
      </EventSourcedListScaffold>
    );
  }

  return (
    <EventSourcedListScaffold
      routeID={ROUTE_ID}
      title="Résumés"
      description="Local-first résumés stored in your event-sourced collection."
      searchPlaceholder="Search résumés…"
      totalPages={totalPages}
      actions={actions}
      dataTest="resumes-list-page"
    >
      <ResponsiveEntityTable
        rows={items}
        columns={[
          { id: "name", header: "Name", cell: (row) => row.name },
          { id: "headline", header: "Headline", cell: (row) => dashIfEmpty(row.headline) },

          {
            id: "fullName",
            header: "Full Name",
            cell: (row) => dashIfEmpty(row.fullName),
            hideOnMobile: true,
          },
          {
            id: "updatedAt",
            header: "Updated",
            cell: (row) => formatLocaleDate(row.updatedAt),
          },
        ]}
        mobileTitle={(row) => row.name}
        mobileSubtitle={(row) => row.headline || undefined}
        dataTest="resumes-table"
        actions={(row) => (
          <RowActionButtons
            onEdit={() => setEditing(row)}
            onDelete={() => handleDelete(row.id)}
            onNavigateToDetails={() =>
              void navigate({
                to: "/event-sourced/resumes/$resumeId",
                params: { resumeId: row.id },
                search: { tab: "edit" },
              })
            }
          />
        )}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Résumé</DialogTitle>
          </DialogHeader>
          <ResumeCreateForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Résumé</DialogTitle>
          </DialogHeader>
          {editing ? <ResumeEditForm item={editing} onSuccess={() => setEditing(null)} /> : null}
        </DialogContent>
      </Dialog>
    </EventSourcedListScaffold>
  );
}
