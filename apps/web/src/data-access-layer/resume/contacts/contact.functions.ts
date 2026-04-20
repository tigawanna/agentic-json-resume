import { viewerMiddleware } from "@/data-access-layer/auth/viewer";
import { createServerFn } from "@tanstack/react-start";
import { deleteContactForUser, listContactsForUser } from "./contact.server";

export const listContacts = createServerFn({ method: "GET" })
  .middleware([viewerMiddleware])
  .inputValidator((input?: { keyword?: string }) => input)
  .handler(async ({ context, data }) => {
    return listContactsForUser(context.viewer.user.id, data?.keyword);
  });

export const deleteContactFn = createServerFn({ method: "POST" })
  .middleware([viewerMiddleware])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    await deleteContactForUser(data.id, context.viewer.user.id);
    return { success: true };
  });
