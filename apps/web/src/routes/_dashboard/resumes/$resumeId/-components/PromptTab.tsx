import { useRouter } from "@tanstack/react-router";
import { PromptCopySection } from "./PromptCopySection";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { resumeCollection } from "@/data-access-layer/resume/resumes-query-collection";
import { useMutation } from "@tanstack/react-query";
import { replaceResumeDoc } from "@/data-access-layer/resume/resume.functions";
import { toast } from "sonner";
import { unwrapUnknownError } from "@/utils/errors";
import { ResumeDocumentV1 } from "@/features/resume/resume-schema";

export function PromptTab({ resumeId, doc }: { resumeId: string; doc: ResumeDocumentV1 }) {
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
