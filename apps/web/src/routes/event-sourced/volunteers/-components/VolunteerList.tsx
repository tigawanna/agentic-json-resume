import { ADMIN_LIST_PER_PAGE } from "@/components/pagination/constants";
import { usePageSearchQuery } from "@/components/search/use-page-search-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import type { ResumeVolunteer } from "@/data-access-layer/event-sourced/schemas";
import { RouterPendingComponent } from "@/lib/tanstack/router/RouterPendingComponent";
import { count, useLiveQuery } from "@tanstack/react-db";
import { Heart, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EventSourcedListScaffold } from "../../-components/EventSourcedListScaffold";
import { LibraryEmpty } from "../../-components/LibraryEmpty";
import {
  ResponsiveEntityTable,
  type ResponsiveColumn,
} from "../../-components/ResponsiveEntityTable";
import { RowActionButtons } from "../../-components/RowActionButtons";
import { listOffset, orIlike, totalPagesFromCount } from "../../-utils/list-query";
import { unwrapUnknownError } from "@/utils/errors";
import { Route } from "..";
import { VolunteerCreateForm, VolunteerCreateFormDialog } from "./VolunteerCreateForm";
import { VolunteerEditForm } from "./VolunteerEditForm";

const ROUTE_ID = "/event-sourced/volunteers/" as const;

const columns: ResponsiveColumn<ResumeVolunteer>[] = [
  {
    id: "organization",
    header: "Organization",
    cell: (row) => row.organization || "—",
  },
  {
    id: "role",
    header: "Role",
    cell: (row) => row.role || "—",
  },
  {
    id: "startDate",
    header: "Start",
    cell: (row) => row.startDate || "—",
  },
  {
    id: "endDate",
    header: "End",
    cell: (row) => row.endDate || "—",
  },
];

export function VolunteerList() {
  const db = useEventSourcedDb();
  const { page = 1, q = "" } = Route.useSearch();
  const { clearSearch } = usePageSearchQuery(ROUTE_ID);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ResumeVolunteer | null>(null);

  const keyword = q.trim();
  const offset = listOffset(page);

  const { data: items, isLoading } = useLiveQuery(
    (query) => {
      const base = query.from({ row: db.collections.resumeVolunteer });
      const filtered = keyword
        ? base.where(({ row }) =>
            orIlike(
              keyword,
              row.organization,
              row.role,
              row.startDate,
              row.endDate,
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
      const base = query.from({ row: db.collections.resumeVolunteer });
      const filtered = keyword
        ? base.where(({ row }) =>
            orIlike(
              keyword,
              row.organization,
              row.role,
              row.startDate,
              row.endDate,
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
      db.collections.resumeVolunteer.delete(id);
      toast.success("Volunteer deleted");
    } catch (err: unknown) {
      toast.error("Failed to delete", { description: unwrapUnknownError(err).message });
    }
  }

  const actions = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCreateOpen(true)}
      data-test="add-volunteers-btn"
    >
      <Plus className="mr-1 size-4" /> Add
    </Button>
  );

  if (isLoading) {
    return (
      <EventSourcedListScaffold
        routeID={ROUTE_ID}
        title="Volunteers"
        description="Volunteer roles in your local library."
        searchPlaceholder="Search volunteer roles…"
        actions={actions}
        dataTest="volunteers-list-page"
      >
        <RouterPendingComponent />
      </EventSourcedListScaffold>
    );
  }

  if (items.length === 0) {
    return (
      <EventSourcedListScaffold
        routeID={ROUTE_ID}
        title="Volunteers"
        description="Volunteer roles in your local library."
        searchPlaceholder="Search volunteer roles…"
        totalPages={0}
        actions={actions}
        dataTest="volunteers-list-page"
      >
        <LibraryEmpty
          icon={Heart}
          title="No Volunteers Yet"
          description="You haven't added any volunteers yet. Create your first entry to get started."
          actionLabel="Create Volunteer"
          onAction={() => setCreateOpen(true)}
          hasSearch={hasSearch}
          onClearSearch={clearSearch}
          dataTest="volunteers-empty"
        />
        <VolunteerCreateFormDialog open={createOpen} setOpen={setCreateOpen} />
      </EventSourcedListScaffold>
    );
  }

  return (
    <EventSourcedListScaffold
      routeID={ROUTE_ID}
      title="Volunteers"
      description="Volunteer roles in your local library."
      searchPlaceholder="Search volunteer roles…"
      totalPages={totalPages}
      actions={actions}
      dataTest="volunteers-list-page"
    >
      <ResponsiveEntityTable
        rows={items}
        columns={columns}
        mobileTitle={(row) => row.organization}
        mobileSubtitle={(row) => row.role || undefined}
        dataTest="volunteers-table"
        actions={(row) => (
          <RowActionButtons onEdit={() => setEditing(row)} onDelete={() => handleDelete(row.id)} />
        )}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Volunteer</DialogTitle>
          </DialogHeader>
          <VolunteerCreateForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Volunteer</DialogTitle>
          </DialogHeader>
          {editing ? <VolunteerEditForm item={editing} onSuccess={() => setEditing(null)} /> : null}
        </DialogContent>
      </Dialog>
    </EventSourcedListScaffold>
  );
}
