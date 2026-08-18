import { ADMIN_LIST_PER_PAGE } from "@/components/pagination/constants";
import { usePageSearchQuery } from "@/components/search/use-page-search-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import type { ResumeExperience } from "@/data-access-layer/event-sourced/schemas";
import { RouterPendingComponent } from "@/lib/tanstack/router/RouterPendingComponent";
import { count, useLiveQuery } from "@tanstack/react-db";
import { Briefcase, Plus } from "lucide-react";
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
import { ExperienceCreateForm, ExperienceCreateFormDialog } from "./ExperienceCreateForm";
import { ExperienceEditForm } from "./ExperienceEditForm";

const ROUTE_ID = "/event-sourced/experiences/" as const;

const columns: ResponsiveColumn<ResumeExperience>[] = [
  {
    id: "role",
    header: "Role",
    cell: (row) => row.role || "—",
  },
  {
    id: "company",
    header: "Company",
    cell: (row) => row.company || "—",
  },
  {
    id: "location",
    header: "Location",
    cell: (row) => row.location || "—",
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

export function ExperienceList() {
  const db = useEventSourcedDb();
  const { page = 1, q = "" } = Route.useSearch();
  const { clearSearch } = usePageSearchQuery(ROUTE_ID);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ResumeExperience | null>(null);

  const keyword = q.trim();
  const offset = listOffset(page);

  const { data: items, isLoading } = useLiveQuery(
    (query) => {
      const base = query.from({ row: db.collections.resumeExperience });
      const filtered = keyword
        ? base.where(({ row }) =>
            orIlike(
              keyword,
              row.role,
              row.company,
              row.location,
              row.startDate,
              row.endDate,
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
      const base = query.from({ row: db.collections.resumeExperience });
      const filtered = keyword
        ? base.where(({ row }) =>
            orIlike(
              keyword,
              row.role,
              row.company,
              row.location,
              row.startDate,
              row.endDate,
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
      db.collections.resumeExperience.delete(id);
      toast.success("Experience deleted");
    } catch (err: unknown) {
      toast.error("Failed to delete", { description: unwrapUnknownError(err).message });
    }
  }

  const actions = (
    <>
      <ImportFromLegacyButton importer="experiences" />
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCreateOpen(true)}
        data-test="add-experiences-btn"
      >
        <Plus className="mr-1 size-4" /> Add
      </Button>
    </>
  );

  if (isLoading) {
    return (
      <EventSourcedListScaffold
        routeID={ROUTE_ID}
        title="Experiences"
        description="Work experiences in your local library."
        searchPlaceholder="Search experiences…"
        actions={actions}
        dataTest="experiences-list-page"
      >
        <RouterPendingComponent />
      </EventSourcedListScaffold>
    );
  }

  if (items.length === 0) {
    return (
      <EventSourcedListScaffold
        routeID={ROUTE_ID}
        title="Experiences"
        description="Work experiences in your local library."
        searchPlaceholder="Search experiences…"
        totalPages={0}
        actions={actions}
        dataTest="experiences-list-page"
      >
        <LibraryEmpty
          icon={Briefcase}
          title="No Experiences Yet"
          description="You haven't added any experiences yet. Create your first entry to get started."
          actionLabel="Create Experience"
          onAction={() => setCreateOpen(true)}
          hasSearch={hasSearch}
          onClearSearch={clearSearch}
          dataTest="experiences-empty"
        />
        <ExperienceCreateFormDialog open={createOpen} setOpen={setCreateOpen} />
      </EventSourcedListScaffold>
    );
  }

  return (
    <EventSourcedListScaffold
      routeID={ROUTE_ID}
      title="Experiences"
      description="Work experiences in your local library."
      searchPlaceholder="Search experiences…"
      totalPages={totalPages}
      actions={actions}
      dataTest="experiences-list-page"
    >
      <ResponsiveEntityTable
        rows={items}
        columns={columns}
        mobileTitle={(row) => row.role}
        mobileSubtitle={(row) => row.company || undefined}
        dataTest="experiences-table"
        actions={(row) => (
          <RowActionButtons onEdit={() => setEditing(row)} onDelete={() => handleDelete(row.id)} />
        )}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Experience</DialogTitle>
          </DialogHeader>
          <ExperienceCreateForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Experience</DialogTitle>
          </DialogHeader>
          {editing ? (
            <ExperienceEditForm item={editing} onSuccess={() => setEditing(null)} />
          ) : null}
        </DialogContent>
      </Dialog>
    </EventSourcedListScaffold>
  );
}
