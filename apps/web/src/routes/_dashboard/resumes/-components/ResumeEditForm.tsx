import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { attachJobToResume, jobListLabel } from "@/data-access-layer/event-sourced/job-rows";
import type { Resume } from "@/data-access-layer/event-sourced/schemas";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { useAppForm } from "@/lib/tanstack/form";
import { unwrapUnknownError } from "@/utils/errors";
import { formOptions } from "@tanstack/react-form";
import { useLiveQuery } from "@tanstack/react-db";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { joinSearchable, touchUpdatedAt } from "../../-utils/row-helpers";

const NONE = "__none__";

const editOpts = formOptions({
  defaultValues: {
    name: "",
    fullName: "",
    headline: "",
    description: "",
    jobId: NONE,
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
  const { data: jobs } = useLiveQuery((q) => q.from({ row: db.collections.job }), []);

  const form = useAppForm({
    ...editOpts,
    defaultValues: {
      name: item.name,
      fullName: item.fullName,
      headline: item.headline,
      description: item.description,
      jobId: item.jobId ?? NONE,
      jobDescription: item.jobDescription,
    },
    onSubmit: async ({ value }) => {
      setPending(true);
      try {
        const nextJobId = value.jobId === NONE ? null : value.jobId;
        db.collections.resume.update(item.id, (draft) => {
          draft.name = value.name;
          draft.fullName = value.fullName;
          draft.headline = value.headline;
          draft.description = value.description;
          draft.searchableText = joinSearchable(
            value.name,
            value.fullName,
            value.headline,
            value.description,
          );
          draft.updatedAt = touchUpdatedAt();
        });
        if (nextJobId) {
          attachJobToResume(db, item.id, nextJobId);
        } else {
          attachJobToResume(db, item.id, null);
          db.collections.resume.update(item.id, (draft) => {
            draft.jobDescription = value.jobDescription;
            draft.updatedAt = touchUpdatedAt();
          });
        }
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
      <form.AppField name="jobId">
        {(field) => (
          <div>
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs">Tracked job</Label>
              <Link to="/jobs" className="text-primary text-xs hover:underline">
                Manage jobs
              </Link>
            </div>
            <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
              <SelectTrigger className="mt-1 w-full" data-test="resume-job-picker">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>None</SelectItem>
                {(jobs ?? []).map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {jobListLabel(job)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </form.AppField>
      <form.Subscribe selector={(s) => s.values.jobId}>
        {(jobId) =>
          jobId === NONE ? (
            <form.AppField name="jobDescription">
              {(field) => (
                <div>
                  <Label className="text-xs">Target job description</Label>
                  <Textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="mt-1 min-h-20"
                    placeholder="Or attach a tracked job above."
                  />
                </div>
              )}
            </form.AppField>
          ) : null
        }
      </form.Subscribe>
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
