import { ResumeEditPanel } from "@/components/resume/ResumeEditPanel";

interface ResumeEditTabProps {
  resumeId: string;
}

export function ResumeEditTab({ resumeId }: ResumeEditTabProps) {
  return <ResumeEditPanel resumeId={resumeId} />;
}
