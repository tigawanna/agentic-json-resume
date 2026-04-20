import { viewerMiddleware } from "@/data-access-layer/auth/viewer";
import { db } from "@/lib/drizzle/client";
import { account } from "@/lib/drizzle/scheam";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { getRepositories, type RepositoryResponse } from "./repos.octo";

export const getGithubRepos = createServerFn({ method: "GET" })
  .middleware([viewerMiddleware])
  .handler(async ({ context }) => {
    const userId = context.viewer.user.id;

    // Get GitHub access token from account table
    const githubAccount = await db.query.account.findFirst({
      where: and(eq(account.userId, userId), eq(account.providerId, "github")),
    });

    if (!githubAccount?.accessToken) {
      return { repos: [], hasToken: false };
    }

    try {
      const repos = await getRepositories(githubAccount.accessToken);
      return { repos, hasToken: true };
    } catch (error) {
      console.error("Failed to fetch GitHub repos:", error);
      throw error;
    }
  });

export type GithubRepo = RepositoryResponse;
