import { Button } from "@/components/ui/button";

import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeEducation } from "@/data-access-layer/event-sourced/schemas";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { useAppForm } from "@/lib/tanstack/form";
import { unwrapUnknownError } from "@/utils/errors";
import { formOptions } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { joinSearchable, touchUpdatedAt } from "../../-utils/row-helpers";

const editOpts = formOptions({
  defaultValues: { school: "", degree: "", field: "", startDate: "", endDate: "", description: "" },
});

interface EducationEditFormProps {
  item: ResumeEducation;
  onSuccess?: () => void;
}

export function EducationEditForm({ item, onSuccess }: EducationEditFormProps) {
  const db = useEventSourcedDb();
  const [pending, setPending] = useState(false);

  const form = useAppForm({
    ...editOpts,
    defaultValues: {
      school: item.school ?? "",
      degree: item.degree ?? "",
      field: item.field ?? "",
      startDate: item.startDate ?? "",
      endDate: item.endDate ?? "",
      description: item.description ?? "",
    },
    onSubmit: async ({ value }) => {
      setPending(true);
      try {
        db.collections.resumeEducation.update(item.id, (draft) => {
          draft.school = value.school;
          draft.degree = value.degree;
          draft.field = value.field;
          draft.startDate = value.startDate;
          draft.endDate = value.endDate;
          draft.description = value.description;
          draft.searchableText = joinSearchable(
            value.school,
            value.degree,
            value.field,
            value.startDate,
            value.endDate,
            value.description,
          );
          draft.updatedAt = touchUpdatedAt();
        });
        toast.success("Education saved");
        onSuccess?.();
      } catch (err: unknown) {
        toast.error("Failed to save education", {
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
          name="school"
          validators={{
            onChange: ({ value }) => (!value?.trim() ? "School is required" : undefined),
          }}
        >
          {(field) => (
            <div>
              <Label className="text-xs">School</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </form.AppField>
        <form.AppField
          name="degree"
          validators={{
            onChange: ({ value }) => (!value?.trim() ? "Qualification is required" : undefined),
          }}
        >
          {(field) => (
            <div>
              <Label className="text-xs">Qualification</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </form.AppField>
      </div>
      <form.AppField name="field">
        {(field) => (
          <div>
            <Label className="text-xs">Field of Study</Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="mt-1"
            />
          </div>
        )}
      </form.AppField>
      <div className="grid gap-3 sm:grid-cols-2">
        <form.AppField name="startDate">
          {(field) => (
            <div>
              <Label className="text-xs">Start</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </form.AppField>
        <form.AppField name="endDate">
          {(field) => (
            <div>
              <Label className="text-xs">End</Label>
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
      <form.Subscribe selector={(s) => s.values}>
        {(values) => {
          const hasRequired = Boolean(values.school.trim()) && Boolean(values.degree.trim());
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
