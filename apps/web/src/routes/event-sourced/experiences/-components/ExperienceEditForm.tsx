import { Button } from "@/components/ui/button";

import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { ResumeExperience } from "@/data-access-layer/event-sourced/schemas";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { useAppForm } from "@/lib/tanstack/form";
import { unwrapUnknownError } from "@/utils/errors";
import { formOptions } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { joinSearchable, touchUpdatedAt } from "../../-utils/row-helpers";

const editOpts = formOptions({
  defaultValues: { role: "", company: "", startDate: "", endDate: "", location: "" },
});

interface ExperienceEditFormProps {
  item: ResumeExperience;
  onSuccess?: () => void;
}

export function ExperienceEditForm({ item, onSuccess }: ExperienceEditFormProps) {
  const db = useEventSourcedDb();
  const [pending, setPending] = useState(false);

  const form = useAppForm({
    ...editOpts,
    defaultValues: {
      role: item.role ?? "",
      company: item.company ?? "",
      startDate: item.startDate ?? "",
      endDate: item.endDate ?? "",
      location: item.location ?? "",
    },
    onSubmit: async ({ value }) => {
      setPending(true);
      try {
        db.collections.resumeExperience.update(item.id, (draft) => {
          draft.role = value.role;
          draft.company = value.company;
          draft.startDate = value.startDate;
          draft.endDate = value.endDate;
          draft.location = value.location;
          draft.searchableText = joinSearchable(
            value.role,
            value.company,
            value.location,
            value.startDate,
            value.endDate,
          );
          draft.updatedAt = touchUpdatedAt();
        });
        toast.success("Experience saved");
        onSuccess?.();
      } catch (err: unknown) {
        toast.error("Failed to save experience", {
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
          name="role"
          validators={{
            onChange: ({ value }) => (!value?.trim() ? "Job Title is required" : undefined),
          }}
        >
          {(field) => (
            <div>
              <Label className="text-xs">Job Title</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </form.AppField>
        <form.AppField
          name="company"
          validators={{
            onChange: ({ value }) => (!value?.trim() ? "Company is required" : undefined),
          }}
        >
          {(field) => (
            <div>
              <Label className="text-xs">Company</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </form.AppField>
      </div>
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
      <form.AppField name="location">
        {(field) => (
          <div>
            <Label className="text-xs">Location</Label>
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
          const hasRequired = Boolean(values.role.trim()) && Boolean(values.company.trim());
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
