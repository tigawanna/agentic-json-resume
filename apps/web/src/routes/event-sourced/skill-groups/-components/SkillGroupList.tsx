import { ADMIN_LIST_PER_PAGE } from "@/components/pagination/constants";
import { usePageSearchQuery } from "@/components/search/use-page-search-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import type { ResumeSkill, ResumeSkillGroup } from "@/data-access-layer/event-sourced/schemas";
import { RouterPendingComponent } from "@/lib/tanstack/router/RouterPendingComponent";
import { unwrapUnknownError } from "@/utils/errors";
import { count, eq, queryOnce, toArray, useLiveQuery } from "@tanstack/react-db";
import { Plus, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EventSourcedListScaffold } from "../../-components/EventSourcedListScaffold";
import { LibraryEmpty } from "../../-components/LibraryEmpty";
import { ResponsiveEntityTable } from "../../-components/ResponsiveEntityTable";
import { RowActionButtons } from "../../-components/RowActionButtons";
import { listOffset, orIlike, totalPagesFromCount } from "../../-utils/list-query";
import { Route } from "..";
import { SkillGroupCreateForm, SkillGroupCreateFormDialog } from "./SkillGroupCreateForm";
import { SkillGroupEditForm } from "./SkillGroupEditForm";

const ROUTE_ID = "/event-sourced/skill-groups/" as const;

type SkillGroupRow = ResumeSkillGroup & { skills: ResumeSkill[] };

export function SkillGroupList() {
  const db = useEventSourcedDb();
  const { page = 1, q = "" } = Route.useSearch();
  const { clearSearch } = usePageSearchQuery(ROUTE_ID);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SkillGroupRow | null>(null);

  const keyword = q.trim();
  const offset = listOffset(page);

  const { data: items, isLoading } = useLiveQuery(
    (query) => {
      const base = query.from({ row: db.collections.resumeSkillGroup });
      const filtered = keyword
        ? base.where(({ row }) => orIlike(keyword, row.name, row.searchableText))
        : base;
      return filtered
        .orderBy(({ row }) => row.updatedAt, "desc")
        .limit(ADMIN_LIST_PER_PAGE)
        .offset(offset)
        .select(({ row }) => ({
          ...row,
          skills: toArray(
            query
              .from({ skill: db.collections.resumeSkill })
              .where(({ skill }) => eq(skill.groupId, row.id))
              .orderBy(({ skill }) => skill.sortOrder, "asc"),
          ),
        }));
    },
    [keyword, offset],
  );

  const { data: totals } = useLiveQuery(
    (query) => {
      const base = query.from({ row: db.collections.resumeSkillGroup });
      const filtered = keyword
        ? base.where(({ row }) => orIlike(keyword, row.name, row.searchableText))
        : base;
      return filtered.select(({ row }) => ({ total: count(row.id) }));
    },
    [keyword],
  );

  const totalItems = totals?.[0]?.total ?? 0;
  const totalPages = totalPagesFromCount(totalItems);
  const hasSearch = keyword.length > 0;

  async function handleDelete(groupId: string) {
    try {
      const related = await queryOnce((query) =>
        query
          .from({ skill: db.collections.resumeSkill })
          .where(({ skill }) => eq(skill.groupId, groupId)),
      );
      for (const skill of related) {
        db.collections.resumeSkill.delete(skill.id);
      }
      db.collections.resumeSkillGroup.delete(groupId);
      toast.success("Skill group deleted");
    } catch (err: unknown) {
      toast.error("Failed to delete", { description: unwrapUnknownError(err).message });
    }
  }

  const actions = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCreateOpen(true)}
      data-test="add-skill-groups-btn"
    >
      <Plus className="mr-1 size-4" /> Add
    </Button>
  );

  if (isLoading) {
    return (
      <EventSourcedListScaffold
        routeID={ROUTE_ID}
        title="Skills"
        description="Skill groups in your local library."
        searchPlaceholder="Search skill groups…"
        actions={actions}
        dataTest="skill-groups-list-page"
      >
        <RouterPendingComponent />
      </EventSourcedListScaffold>
    );
  }

  if (items.length === 0) {
    return (
      <EventSourcedListScaffold
        routeID={ROUTE_ID}
        title="Skills"
        description="Skill groups in your local library."
        searchPlaceholder="Search skill groups…"
        totalPages={0}
        actions={actions}
        dataTest="skill-groups-list-page"
      >
        <LibraryEmpty
          icon={Wrench}
          title="No Skill Groups Yet"
          description="You haven't added any skill groups yet. Create your first group to get started."
          actionLabel="Create Skill Group"
          onAction={() => setCreateOpen(true)}
          hasSearch={hasSearch}
          onClearSearch={clearSearch}
          dataTest="skill-groups-empty"
        />
        <SkillGroupCreateFormDialog open={createOpen} setOpen={setCreateOpen} />
      </EventSourcedListScaffold>
    );
  }

  return (
    <EventSourcedListScaffold
      routeID={ROUTE_ID}
      title="Skills"
      description="Skill groups in your local library."
      searchPlaceholder="Search skill groups…"
      totalPages={totalPages}
      actions={actions}
      dataTest="skill-groups-list-page"
    >
      <ResponsiveEntityTable
        rows={items}
        columns={[
          {
            id: "name",
            header: "Group",
            cell: (row) => row.name,
          },
          {
            id: "skills",
            header: "Skills",
            cell: (row) =>
              row.skills.length > 0 ? (
                <span className="text-muted-foreground line-clamp-2 max-w-md whitespace-normal">
                  {row.skills.map((skill) => skill.name).join(", ")}
                </span>
              ) : (
                "—"
              ),
          },
          {
            id: "count",
            header: "Count",
            cell: (row) => String(row.skills.length),
            hideOnMobile: true,
          },
        ]}
        mobileTitle={(row) => row.name}
        mobileSubtitle={(row) =>
          row.skills.length > 0 ? row.skills.map((skill) => skill.name).join(", ") : undefined
        }
        dataTest="skill-groups-table"
        actions={(row) => (
          <RowActionButtons onEdit={() => setEditing(row)} onDelete={() => handleDelete(row.id)} />
        )}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Skill Group</DialogTitle>
          </DialogHeader>
          <SkillGroupCreateForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Skill Group</DialogTitle>
          </DialogHeader>
          {editing ? (
            <SkillGroupEditForm
              group={editing}
              skills={editing.skills}
              onSuccess={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </EventSourcedListScaffold>
  );
}
