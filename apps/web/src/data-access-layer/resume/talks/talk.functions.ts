import { viewerMiddleware } from "@/data-access-layer/auth/viewer";
import { createServerFn } from "@tanstack/react-start";
import { deleteTalkForUser, listTalksForUser } from "./talk.server";

export const listTalks = createServerFn({ method: "GET" })
  .middleware([viewerMiddleware])
  .inputValidator((input?: { keyword?: string }) => input)
  .handler(async ({ context, data }) => {
    return listTalksForUser(context.viewer.user.id, data?.keyword);
  });

export const deleteTalkFn = createServerFn({ method: "POST" })
  .middleware([viewerMiddleware])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    await deleteTalkForUser(data.id, context.viewer.user.id);
    return { success: true };
  });
