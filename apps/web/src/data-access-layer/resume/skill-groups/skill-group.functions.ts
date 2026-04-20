import { viewerMiddleware } from "@/data-access-layer/auth/viewer";
import { createServerFn } from "@tanstack/react-start";
import { deleteSkillGroupForUser, listSkillGroupsForUser } from "./skill-group.server";

export const listSkillGroups = createServerFn({ method: "GET" })
  .middleware([viewerMiddleware])
  .inputValidator((input?: { keyword?: string }) => input)
  .handler(async ({ context, data }) => {
    return listSkillGroupsForUser(context.viewer.user.id, data?.keyword);
  });

export const deleteSkillGroupFn = createServerFn({ method: "POST" })
  .middleware([viewerMiddleware])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    await deleteSkillGroupForUser(data.id, context.viewer.user.id);
    return { success: true };
  });
