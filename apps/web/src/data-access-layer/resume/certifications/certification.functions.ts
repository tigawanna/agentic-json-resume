import { viewerMiddleware } from "@/data-access-layer/auth/viewer";
import { createServerFn } from "@tanstack/react-start";
import { deleteCertificationForUser, listCertificationsForUser } from "./certification.server";

export const listCertifications = createServerFn({ method: "GET" })
  .middleware([viewerMiddleware])
  .inputValidator((input?: { keyword?: string }) => input)
  .handler(async ({ context, data }) => {
    return listCertificationsForUser(context.viewer.user.id, data?.keyword);
  });

export const deleteCertificationFn = createServerFn({ method: "POST" })
  .middleware([viewerMiddleware])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    await deleteCertificationForUser(data.id, context.viewer.user.id);
    return { success: true };
  });
