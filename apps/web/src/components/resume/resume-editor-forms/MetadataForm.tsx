import { useResumeWorkspace } from "@/components/resume/resume-workspace/ResumeWorkspaceContext";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobListLabel } from "@/data-access-layer/event-sourced/job-rows";
import { TEMPLATE_IDS } from "@/features/resume/resume-schema";
import { useAppForm } from "@/lib/tanstack/form";
import { unwrapUnknownError } from "@/utils/errors";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

interface MetadataFormProps {
  resumeId: string;
}

const NONE = "__none__";

const formOpts = formOptions({
  defaultValues: {
    name: "",
    fullName: "",
    headline: "",
    description: "",
    jobId: NONE,
    jobDescription: "",
    templateId: "classic",
  },
});

export function MetadataForm({ resumeId }: MetadataFormProps) {
  const { resume, updateMetadata, jobs } = useResumeWorkspace();
  const canAttachJob = Boolean(jobs);

  const mutation = useMutation({
    mutationFn: async (values: typeof formOpts.defaultValues) =>
      updateMetadata({
        ...values,
        jobId: canAttachJob
          ? values.jobId === NONE
            ? null
            : values.jobId
          : (resume?.jobId ?? null),
        templateId: z.enum(TEMPLATE_IDS).parse(values.templateId),
      }),
    onSuccess() {
      toast.success("Resume updated");
    },
    onError(err: unknown) {
      toast.error("Failed to update resume", {
        description: unwrapUnknownError(err).message,
      });
    },
    meta: { invalidates: [["resumes"]] },
  });

  const form = useAppForm({
    ...formOpts,
    defaultValues: {
      name: resume?.name ?? "",
      fullName: resume?.fullName ?? "",
      headline: resume?.headline ?? "",
      description: resume?.description ?? "",
      jobId: resume?.jobId ?? NONE,
      jobDescription: resume?.jobDescription ?? "",
      templateId: resume?.templateId ?? "classic",
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  if (!resume) return null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();

        void form.handleSubmit();
      }}
      className="flex flex-col gap-4"
      data-test="metadata-form"
    >
      <form.AppField name="name" validators={{ onChange: z.string().min(1, "Name is required") }}>
        {(field) => <field.TextField label="Resume Name" />}
      </form.AppField>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.AppField name="fullName">
          {(field) => <field.TextField label="Full Name" />}
        </form.AppField>

        <form.AppField name="headline">
          {(field) => <field.TextField label="Headline" />}
        </form.AppField>
      </div>

      <form.AppField name="description">
        {(field) => <field.TextAreaField label="Description" />}
      </form.AppField>

      {canAttachJob ? (
        <form.AppField name="jobId">
          {(field) => (
            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <Label>Tracked job</Label>
                <Link to="/jobs" className="text-primary text-xs hover:underline">
                  Manage jobs
                </Link>
              </div>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
              >
                <SelectTrigger className="w-full" data-test="resume-job-picker">
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
      ) : null}

      {canAttachJob ? (
        <form.Subscribe selector={(s) => s.values.jobId}>
          {(jobId) =>
            jobId === NONE ? (
              <form.AppField name="jobDescription">
                {(field) => (
                  <field.TextAreaField
                    label="Target job description"
                    placeholder="Or attach a tracked job above."
                  />
                )}
              </form.AppField>
            ) : null
          }
        </form.Subscribe>
      ) : (
        <form.AppField name="jobDescription">
          {(field) => <field.TextAreaField label="Job Description" />}
        </form.AppField>
      )}
      <form.AppForm>
        <form.SubmitButton label="Save" />
      </form.AppForm>
    </form>
  );
}
