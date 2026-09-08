import { viewerMiddleware } from "@/data-access-layer/auth/viewer";
import { resumeDocumentV1Schema } from "@/features/resume/resume-schema";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  deletePublicResumeForSource,
  getPublicResumeById,
  getPublicResumeForSource,
  upsertPublicResume,
} from "./public-resume.server";

const publishInputSchema = z.object({
  sourceResumeId: z.string().min(1),
  title: z.string().min(1),
  document: resumeDocumentV1Schema,
});

/** Anonymous: load a published snapshot by public id. */
export const getPublicResume = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    return getPublicResumeById(data.id);
  });

/** Auth: whether this local résumé already has a public link. */
export const getMyPublicResume = createServerFn({ method: "GET" })
  .middleware([viewerMiddleware])
  .inputValidator((input: { sourceResumeId: string }) =>
    z.object({ sourceResumeId: z.string().min(1) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    return getPublicResumeForSource(context.viewer.user.id, data.sourceResumeId);
  });

/** Auth: publish or refresh the public snapshot (direct DB write, not sync). */
export const publishPublicResume = createServerFn({ method: "POST" })
  .middleware([viewerMiddleware])
  .inputValidator((input: z.infer<typeof publishInputSchema>) => publishInputSchema.parse(input))
  .handler(async ({ context, data }) => {
    return upsertPublicResume({
      userId: context.viewer.user.id,
      sourceResumeId: data.sourceResumeId,
      title: data.title,
      document: data.document,
    });
  });

/** Auth: remove the public snapshot for this local résumé. */
export const unpublishPublicResume = createServerFn({ method: "POST" })
  .middleware([viewerMiddleware])
  .inputValidator((input: { sourceResumeId: string }) =>
    z.object({ sourceResumeId: z.string().min(1) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const removed = await deletePublicResumeForSource(
      context.viewer.user.id,
      data.sourceResumeId,
    );
    return { success: removed };
  });
