import { ScrollArea } from "@/components/ui/scroll-area";
import { resumeDetailToDocument } from "@/data-access-layer/resume/resume-converters";
import type { ResumeDetailDTO } from "@/data-access-layer/resume/resume.types";

interface ResumeJsonTabProps {
  resume: ResumeDetailDTO;
}

export function ResumeJsonTab({ resume }: ResumeJsonTabProps) {
  const doc = resumeDetailToDocument(resume);

  return (
    <div className="mx-auto max-w-3xl" data-test="resume-json-tab">
      <ScrollArea className="h-[600px]">
        <pre className="bg-muted rounded-lg p-4 text-xs">
          <code>{JSON.stringify(doc, null, 2)}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}
