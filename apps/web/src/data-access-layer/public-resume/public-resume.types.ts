import type { ResumeDocumentV1 } from "@/features/resume/resume-schema";

export type PublicResumeDTO = {
  id: string;
  sourceResumeId: string;
  title: string;
  document: ResumeDocumentV1;
  publishedAt: Date;
  updatedAt: Date;
};

/** List row without the full document blob. */
export type PublicResumeListItemDTO = {
  id: string;
  sourceResumeId: string;
  title: string;
  headline: string;
  publishedAt: Date;
  updatedAt: Date;
};

export type PublicResumeListResult = {
  items: PublicResumeListItemDTO[];
  total: number;
};
