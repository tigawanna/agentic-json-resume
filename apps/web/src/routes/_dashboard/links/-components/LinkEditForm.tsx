import { Button } from "@/components/ui/button";

import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { ResumeLink } from "@/data-access-layer/event-sourced/schemas";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { useAppForm } from "@/lib/tanstack/form";
import { unwrapUnknownError } from "@/utils/errors";
import { formOptions } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { joinSearchable, touchUpdatedAt } from "../../-utils/row-helpers";

const editOpts = formOptions({
  defaultValues: { label: "", icon: "", url: "" },
});

interface LinkEditFormProps {
  item: ResumeLink;
  onSuccess?: () => void;
}

export function LinkEditForm({ item, onSuccess }: LinkEditFormProps) {
  const db = useEventSourcedDb();
  const [pending, setPending] = useState(false);

  const form = useAppForm({
    ...editOpts,
    defaultValues: {
      label: item.label ?? "",
      icon: item.icon ?? "",
      url: item.url ?? "",
    },
    onSubmit: async ({ value }) => {
      setPending(true);
      try {
        db.collections.resumeLink.update(item.id, (draft) => {
          draft.label = value.label;
          draft.icon = value.icon.trim() || null;
          draft.url = value.url;
          draft.searchableText = joinSearchable(value.label, value.url, value.icon);
          draft.updatedAt = touchUpdatedAt();
        });
        toast.success("Link saved");
        onSuccess?.();
      } catch (err: unknown) {
        toast.error("Failed to save link", {
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
      <div className="grid gap-3 sm:grid-cols-2">
        <form.AppField
          name="label"
          validators={{
            onChange: ({ value }) => (!value?.trim() ? "Label is required" : undefined),
          }}
        >
          {(field) => (
            <div>
              <Label className="text-xs">Label</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </form.AppField>
        <form.AppField name="icon">
          {(field) => (
            <div>
              <Label className="text-xs">Icon</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </form.AppField>
      </div>
      <form.AppField
        name="url"
        validators={{
          onChange: ({ value }) => (!value?.trim() ? "URL is required" : undefined),
        }}
      >
        {(field) => (
          <div>
            <Label className="text-xs">URL</Label>
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
          const hasRequired = Boolean(values.label.trim()) && Boolean(values.url.trim());
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
