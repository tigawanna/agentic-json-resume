"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { deleteSavedProject } from "@/data-access-layer/saved-project/saved-project.functions";
import { savedProjectDtoToResumeItem } from "@/data-access-layer/saved-project/saved-project.mapper";
import { savedProjectsListQueryOptions } from "@/data-access-layer/saved-project/saved-project-query-options";
import type { ResumeProjectItem } from "@/features/resume/resume-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { unwrapUnknownError } from "@/utils/errors";

export function ProjectLibraryDialog({
  open,
  onOpenChange,
  onAttach,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAttach: (items: ResumeProjectItem[]) => void;
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setDebouncedSearch("");
      setSelectedIds(new Set());
    }
  }, [open]);

  const { data: rows = [], isLoading } = useQuery({
    ...savedProjectsListQueryOptions(debouncedSearch),
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteSavedProject({ data: { id } }),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: [queryKeyPrefixes.savedProjects] });
      toast.success("Removed from library");
    },
    onError(err: unknown) {
      toast.error("Failed to remove", { description: unwrapUnknownError(err).message });
    },
  });

  function toggleId(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAttach() {
    const chosen = rows.filter((r) => selectedIds.has(r.id));
    if (chosen.length === 0) {
      toast.message("Select at least one project");
      return;
    }
    onAttach(chosen.map(savedProjectDtoToResumeItem));
    setSelectedIds(new Set());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-base-300 border-b px-6 py-4">
          <DialogTitle>Project library</DialogTitle>
          <DialogDescription>
            Search your saved projects and attach copies to this résumé.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 px-6 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="library-search" className="text-xs">
              Search
            </Label>
            <Input
              id="library-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, description, tech…"
              data-test="project-library-search"
            />
          </div>
          <div
            className="border-base-300 bg-base-200/40 max-h-[min(360px,50vh)] overflow-y-auto rounded-lg border"
            data-test="project-library-list"
          >
            {isLoading ? (
              <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
                <Loader2 className="size-4 animate-spin" />
                Loading…
              </div>
            ) : rows.length === 0 ? (
              <p className="text-muted-foreground px-4 py-10 text-center text-sm">
                No saved projects yet. Use &quot;Save to library&quot; on a project in the editor.
              </p>
            ) : (
              <ul className="divide-base-300 divide-y">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className="hover:bg-base-200/60 flex items-start gap-3 px-3 py-3 transition-colors"
                  >
                    <Checkbox
                      id={`lib-${row.id}`}
                      checked={selectedIds.has(row.id)}
                      onCheckedChange={() => toggleId(row.id)}
                      className="mt-1"
                      data-test={`project-library-row-${row.id}`}
                    />
                    <div className="min-w-0 flex-1">
                      <label htmlFor={`lib-${row.id}`} className="cursor-pointer">
                        <span className="text-sm font-medium">{row.name}</span>
                        {row.description ? (
                          <span className="text-muted-foreground line-clamp-2 block text-xs">
                            {row.description}
                          </span>
                        ) : null}
                        {row.tech.length > 0 ? (
                          <span className="text-muted-foreground mt-1 block text-xs">
                            {row.tech.join(" · ")}
                          </span>
                        ) : null}
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground shrink-0"
                      disabled={deleteMutation.isPending}
                      aria-label="Delete from library"
                      onClick={() => deleteMutation.mutate(row.id)}
                      data-test={`project-library-delete-${row.id}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <DialogFooter className="border-base-300 bg-base-100/95 gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAttach}
            disabled={selectedIds.size === 0 || isLoading}
            data-test="project-library-attach"
          >
            Attach selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
