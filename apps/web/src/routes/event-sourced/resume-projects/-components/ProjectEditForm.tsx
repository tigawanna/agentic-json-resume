import { Button } from "@/components/ui/button";

import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeProject } from "@/data-access-layer/event-sourced/schemas";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { useAppForm } from "@/lib/tanstack/form";
import { unwrapUnknownError } from "@/utils/errors";
import { formOptions } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { joinSearchable, touchUpdatedAt } from "../../-utils/row-helpers";

const editOpts = formOptions({
  defaultValues: { name: "", url: "", homepageUrl: "", description: "", tech: "[]" },
});

interface ProjectEditFormProps {
  item: ResumeProject;
  onSuccess?: () => void;
}

export function ProjectEditForm({ item, onSuccess }: ProjectEditFormProps) {
  const db = useEventSourcedDb();
  const [pending, setPending] = useState(false);

  const form = useAppForm({
    ...editOpts,
    defaultValues: {
      name: item.name ?? "",
      url: item.url ?? "",
      homepageUrl: item.homepageUrl ?? "",
      description: item.description ?? "",
      tech: (() => {
        try {
          const parsed = JSON.parse(item.tech) as unknown;
          return Array.isArray(parsed) ? parsed.join(", ") : item.tech;
        } catch {
          return item.tech;
        }
      })(),
    },
    onSubmit: async ({ value }) => {
      setPending(true);
      try {
        const techRaw = value.tech.trim();
        const tech = techRaw.startsWith("[")
          ? techRaw
          : JSON.stringify(
              techRaw
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            );
        db.collections.resumeProject.update(item.id, (draft) => {
          draft.name = value.name;
          draft.url = value.url;
          draft.homepageUrl = value.homepageUrl;
          draft.description = value.description;
          draft.tech = tech;
          draft.searchableText = joinSearchable(
            value.name,
            value.url,
            value.homepageUrl,
            value.description,
            tech,
          );
          draft.updatedAt = touchUpdatedAt();
        });
        toast.success("Project saved");
        onSuccess?.();
      } catch (err: unknown) {
        toast.error("Failed to save project", {
          description: unwrapUnknownError(err).message,
        });
      } finally {
        setPending(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-3"
    >
      <form.AppField
        name="name"
        validators={{
          onChange: ({ value }) => (!value?.trim() ? "Name is required" : undefined),
        }}
      >
        {(field) => (
          <div>
            <Label className="text-xs">Name</Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="mt-1"
            />
          </div>
        )}
      </form.AppField>
      <div className="grid gap-3 sm:grid-cols-2">
        <form.AppField name="url">
          {(field) => (
            <div>
              <Label className="text-xs">Repo URL</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </form.AppField>
        <form.AppField name="homepageUrl">
          {(field) => (
            <div>
              <Label className="text-xs">Homepage</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </form.AppField>
      </div>
      <form.AppField name="description">
        {(field) => (
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="mt-1 min-h-24"
            />
          </div>
        )}
      </form.AppField>
      <form.AppField name="tech">
        {(field) => (
          <div>
            <Label className="text-xs">Tech (comma-separated)</Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="mt-1"
            />
          </div>
        )}
      </form.AppField>
      <form.Subscribe selector={(s) => s.values}>
        {(values) => {
          const hasRequired = Boolean(values.name.trim());
          return (
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={pending}
              >
                Reset
              </Button>
              <Button type="submit" disabled={pending || !hasRequired || !form.state.isFormValid}>
                {pending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
