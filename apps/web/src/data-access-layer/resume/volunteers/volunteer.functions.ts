import { viewerMiddleware } from "@/data-access-layer/auth/viewer";
import { createServerFn } from "@tanstack/react-start";
import { deleteVolunteerForUser, listVolunteersForUser } from "./volunteer.server";

export const listVolunteers = createServerFn({ method: "GET" })
  .middleware([viewerMiddleware])
  .inputValidator((input?: { keyword?: string }) => input)
  .handler(async ({ context, data }) => {
    return listVolunteersForUser(context.viewer.user.id, data?.keyword);
  });

export const deleteVolunteerFn = createServerFn({ method: "POST" })
  .middleware([viewerMiddleware])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    await deleteVolunteerForUser(data.id, context.viewer.user.id);
    return { success: true };
  });
