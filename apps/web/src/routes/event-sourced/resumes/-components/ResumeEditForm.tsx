import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Resume } from "@/data-access-layer/event-sourced/schemas";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { useAppForm } from "@/lib/tanstack/form";
import { unwrapUnknownError } from "@/utils/errors";
import { formOptions } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { joinSearchable, touchUpdatedAt } from "../../-utils/row-helpers";

const editOpts = formOptions({
  defaultValues: {
    name: "",
    fullName: "",
    headline: "",
    description: "",
    jobDescription: "",
  },
});

interface ResumeEditFormProps {
  item: Resume;
  onSuccess?: () => void;
}

export function ResumeEditForm({ item, onSuccess }: ResumeEditFormProps) {
  const db = useEventSourcedDb();
  const [pending, setPending] = useState(false);

  const form = useAppForm({
    ...editOpts,
    defaultValues: {
      name: item.name,
      fullName: item.fullName,
      headline: item.headline,
      description: item.description,
      jobDescription: item.jobDescription,
    },
    onSubmit: async ({ value }) => {
      setPending(true);
      try {
        db.collections.resume.update(item.id, (draft) => {
          draft.name = value.name;
          draft.fullName = value.fullName;
          draft.headline = value.headline;
          draft.description = value.description;
          draft.jobDescription = value.jobDescription;
          draft.searchableText = joinSearchable(
            value.name,
            value.fullName,
            value.headline,
            value.description,
          );
          draft.updatedAt = touchUpdatedAt();
        });
        toast.success("Résumé saved");
        onSuccess?.();
      } catch (err: unknown) {
        toast.error("Failed to save résumé", {
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
            <Label className="text-xs">Display Name</Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="mt-1"
            />
          </div>
        )}
      </form.AppField>
      <div className="grid gap-3 sm:grid-cols-2">
        <form.AppField name="fullName">
          {(field) => (
            <div>
              <Label className="text-xs">Full Name</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </form.AppField>
        <form.AppField name="headline">
          {(field) => (
            <div>
              <Label className="text-xs">Headline</Label>
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
              className="mt-1 min-h-20"
            />
          </div>
        )}
      </form.AppField>
      <form.AppField name="jobDescription">
        {(field) => (
          <div>
            <Label className="text-xs">Target Job Description</Label>
            <Textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="mt-1 min-h-20"
            />
          </div>
        )}
      </form.AppField>
      <form.Subscribe selector={(s) => s.values}>
        {(values) => (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => form.reset()} disabled={pending}>
              Reset
            </Button>
            <Button
              type="submit"
              disabled={pending || !values.name.trim() || !form.state.isFormValid}
            >
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        )}
      </form.Subscribe>
    </form>
  );
}
