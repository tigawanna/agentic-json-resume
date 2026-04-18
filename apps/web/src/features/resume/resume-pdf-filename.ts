import type { ResumeDocumentV1 } from "./resume-schema";

// oxlint-disable-next-line no-control-regex
const ILLEGAL_FILE_CHARS = /[<>:"/\\|?*\u0000-\u001f]/g;

export function resumePdfFileStem(resumeName: string | undefined, doc: ResumeDocumentV1): string {
  const candidate = resumeName?.trim() || doc.header.fullName.trim();
  if (!candidate) return "resume";
  const cleaned = candidate
    .replace(ILLEGAL_FILE_CHARS, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  const stem = cleaned.slice(0, 200);
  return stem || "resume";
}
