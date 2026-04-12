import type { ResumeDocumentV1 } from "@/features/resume/resume-schema";

export interface ResumeDTO {
  id: string;
  userId: string;
  name: string;
  description: string;
  jobDescription: string;
  data: ResumeDocumentV1;
  createdAt: string;
  updatedAt: string;
}
