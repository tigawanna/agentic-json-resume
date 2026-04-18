import { resumeDetailToDocument } from "@/data-access-layer/resume/resume-converters";
import type { ResumeDetailDTO } from "@/data-access-layer/resume/resume.types";
import { resumeRegistry } from "@/features/resume/resume-catalog";
import { resumeDocumentToSpec } from "@/features/resume/resume-to-spec";
import { JSONUIProvider, Renderer } from "@json-render/react";

interface ResumePreviewTabProps {
  resume: ResumeDetailDTO;
}

export function ResumePreviewTab({ resume }: ResumePreviewTabProps) {
  const doc = resumeDetailToDocument(resume);
  const spec = resumeDocumentToSpec(doc);

  return (
    <div className="mx-auto max-w-3xl" data-test="resume-preview-tab">
      <div className="rounded-lg border bg-white p-8 text-black shadow-sm">
        <JSONUIProvider registry={resumeRegistry}>
          <Renderer spec={spec} registry={resumeRegistry} />
        </JSONUIProvider>
      </div>
    </div>
  );
}
