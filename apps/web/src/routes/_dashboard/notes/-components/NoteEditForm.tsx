import { Button } from "@/components/ui/button";

import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeNote } from "@/data-access-layer/event-sourced/schemas";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { useAppForm } from "@/lib/tanstack/form";
import { unwrapUnknownError } from "@/utils/errors";
import { formOptions } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { joinSearchable, touchUpdatedAt } from "../../-utils/row-helpers";

const editOpts = formOptions({
  defaultValues: { label: "Notes", text: "" },
});

interface NoteEditFormProps {
  item: ResumeNote;
  onSuccess?: () => void;
}

export function NoteEditForm({ item, onSuccess }: NoteEditFormProps) {
  const db = useEventSourcedDb();
  const [pending, setPending] = useState(false);

  const form = useAppForm({
    ...editOpts,
    defaultValues: {
      label: item.label ?? "Notes",
      text: item.text ?? "",
    },
    onSubmit: async ({ value }) => {
      setPending(true);
      try {
        const label = value.label.trim() || "Notes";
        db.collections.resumeNote.update(item.id, (draft) => {
          draft.label = label;
          draft.text = value.text;
          draft.searchableText = joinSearchable(label, value.text);
          draft.updatedAt = touchUpdatedAt();
        });
        toast.success("Note saved");
        onSuccess?.();
      } catch (err: unknown) {
        toast.error("Failed to save note", {
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
      <form.AppField name="label">
        {(field) => (
          <div>
            <Label className="text-xs">Heading</Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="mt-1"
            />
          </div>
        )}
      </form.AppField>
      <form.AppField
        name="text"
        validators={{
          onChange: ({ value }) => (!value?.trim() ? "Note text is required" : undefined),
        }}
      >
        {(field) => (
          <div>
            <Label className="text-xs">Body</Label>
            <Textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="mt-1 min-h-32"
            />
          </div>
        )}
      </form.AppField>
      <form.Subscribe selector={(s) => s.values}>
        {(values) => {
          const hasRequired = Boolean(values.text.trim());
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
