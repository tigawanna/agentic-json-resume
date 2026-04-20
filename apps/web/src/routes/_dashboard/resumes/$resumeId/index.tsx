import { ResumeJsonTab } from "@/components/resume/resume-json-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resumeDetailToDocument } from "@/data-access-layer/resume/resume-converters";
import { resumeDetailQueryOptions } from "@/data-access-layer/resume/resume-query-options";
import { replaceResumeDoc, updateResumeMeta } from "@/data-access-layer/resume/resume.functions";
import type { ResumeDetailDTO } from "@/data-access-layer/resume/resume.types";
import { resumeCollection } from "@/data-access-layer/resume/resumes-query-collection";
import {
  TEMPLATE_IDS,
  TEMPLATE_LABELS,
  type ResumeDocumentV1,
  type TemplateId,
} from "@/features/resume/resume-schema";
import { unwrapUnknownError } from "@/utils/errors";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { PromptCopySection } from "./-components/PromptCopySection";
import { ResumeEditTab } from "./-components/ResumeEditTab";
import { ResumePreviewTab } from "./-components/ResumePreviewTab";

const tabSchema = z
  .enum(["edit", "preview", "json", "prompt"])
  .default("edit")
  .catch("edit");

export const Route = createFileRoute("/_dashboard/resumes/$resumeId/")({
  component: ResumeWorkbench,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(resumeDetailQueryOptions(params.resumeId)),
  head: () => ({
    meta: [{ title: "Edit Resume", description: "Resume workbench" }],
  }),
  validateSearch: (search) =>
    z.object({ tab: tabSchema }).parse(search),
  ssr: false,
});

// ─── Template Picker ────────────────────────────────────────

const TEMPLATE_DESCRIPTIONS: Record<TemplateId, string> = {
  classic: "Single column, centered headings",
  sidebar: "Two columns — main left, sidebar right",
  accent: "Single column with warm accent",
  modern: "Two columns with cool accent",
};

function TemplatePicker({
  selected,
  onSelect,
}: {
  selected: TemplateId;
  onSelect: (id: TemplateId) => void;
}) {
  return (
    <div className="flex flex-col gap-2" data-test="template-picker">
      <h2 className="text-sm font-medium">Template</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TEMPLATE_IDS.map((tid) => (
          <button
            key={tid}
            type="button"
            onClick={() => onSelect(tid)}
            className={twMerge(
              "flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-colors",
              tid === selected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30",
            )}
            data-test={`template-${tid}`}>
            <span className="text-sm font-semibold">{TEMPLATE_LABELS[tid]}</span>
            <span className="text-muted-foreground text-xs">{TEMPLATE_DESCRIPTIONS[tid]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Workbench ──────────────────────────────────────────────

function ResumeWorkbench() {
  const { resumeId } = Route.useParams();
  const { data: serverResume } = useSuspenseQuery(resumeDetailQueryOptions(resumeId));

  // Read reactively from the collection (on-demand fetch triggered by the where clause)
  const { data: resume } = useLiveQuery((q) =>
    q
      .from({ resume: resumeCollection })
      .where(({ resume }) => eq(resume.id, resumeId))
      .findOne(),
  );

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(
    (serverResume?.templateId as TemplateId) ?? "classic",
  );
  const [initialTemplateId] = useState<TemplateId>(
    (serverResume?.templateId as TemplateId) ?? "classic",
  );

  const displayResume = resume ?? serverResume;

  if (!displayResume) {
    return <p className="text-muted-foreground py-8 text-center">Resume not found.</p>;
  }

  const doc = resumeDetailToDocument(displayResume);
  const hasTemplateChange = selectedTemplate !== initialTemplateId;

  return (
    <ResumeWorkbenchInner
      resumeId={resumeId}
      resume={displayResume}
      selectedTemplate={selectedTemplate}
      setSelectedTemplate={setSelectedTemplate}
      doc={doc}
      hasTemplateChange={hasTemplateChange}
    />
  );
}

interface ResumeWorkbenchInnerProps {
  resumeId: string;
  resume: ResumeDetailDTO;
  selectedTemplate: TemplateId;
  setSelectedTemplate: (t: TemplateId) => void;
  doc: ResumeDocumentV1;
  hasTemplateChange: boolean;
}

function ResumeWorkbenchInner({
  resumeId,
  resume,
  selectedTemplate,
  setSelectedTemplate,
  doc,
  hasTemplateChange,
}: ResumeWorkbenchInnerProps) {
  const router = useRouter();
  const { tab } = Route.useSearch();

  function navigateToTab(value: string) {
    void router.navigate({
      to: ".",
      search: (prev: Record<string, unknown>) => ({ ...prev, tab: value }),
      replace: true,
    });
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      await updateResumeMeta({ data: { id: resumeId, templateId: selectedTemplate } });
    },
    onSuccess() {
      resumeCollection.utils.writeUpdate({
        id: resumeId,
        templateId: selectedTemplate,
      });
      toast.success("Template saved");
    },
    onError(err: unknown) {
      toast.error("Failed to save", {
        description: unwrapUnknownError(err).message,
      });
    },
    meta: { invalidates: [["resumes"]] },
  });

  return (
    <div className="flex w-full flex-col gap-6 pb-24" data-test="resume-workbench">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{resume.name}</h1>
          {resume.headline && (
            <p className="text-muted-foreground mt-1 text-sm">{resume.headline}</p>
          )}
        </div>
      </div>

      {/* Template Picker */}
      <TemplatePicker selected={selectedTemplate} onSelect={setSelectedTemplate} />

      {/* Tabs + Save */}
      <Tabs value={tab} onValueChange={navigateToTab} className="w-full">
        <div className="flex flex-wrap items-center gap-3">
          <TabsList className="flex-1">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="prompt">LLM Prompt</TabsTrigger>
          </TabsList>

          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !hasTemplateChange}
            className="gap-2"
            size="sm"
            data-test="resume-save-button">
            <Save className="size-4" />
            {saveMutation.isPending ? "Saving..." : hasTemplateChange ? "Save template" : "Saved"}
          </Button>
        </div>

        <TabsContent value="edit" forceMount className="mt-4 data-[state=inactive]:hidden">
          <ResumeEditTab resumeId={resumeId} />
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <ResumePreviewTab resumeId={resumeId} selectedTemplate={selectedTemplate} doc={doc} />
        </TabsContent>

        <TabsContent value="json" forceMount className="mt-4 data-[state=inactive]:hidden">
          <ResumeJsonTab resumeId={resumeId} />
        </TabsContent>

        <TabsContent value="prompt" className="mt-4">
          <PromptTab resumeId={resumeId} doc={doc} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PromptTab({ resumeId, doc }: { resumeId: string; doc: ResumeDocumentV1 }) {
  const router = useRouter();
  const { data: resume } = useLiveQuery((q) =>
    q
      .from({ resume: resumeCollection })
      .where(({ resume }) => eq(resume.id, resumeId))
      .findOne(),
  );

  const applyMutation = useMutation({
    mutationFn: async (newDoc: ResumeDocumentV1) => {
      await replaceResumeDoc({ data: { id: resumeId, doc: newDoc } });
    },
    onSuccess() {
      resumeCollection.utils.refetch();
      toast.success("Resume updated — switching to editor");
      void router.navigate({
        to: ".",
        search: (prev: Record<string, unknown>) => ({ ...prev, tab: "edit" }),
        replace: true,
      });
    },
    onError(err: unknown) {
      toast.error("Failed to apply result", {
        description: unwrapUnknownError(err).message,
      });
    },
    meta: { invalidates: [["resumes"]] },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PromptCopySection
        doc={doc}
        jobDescription={resume?.jobDescription ?? ""}
        onApplyResult={(newDoc) => applyMutation.mutateAsync(newDoc)}
        isApplying={applyMutation.isPending}
      />
    </div>
  );
}
