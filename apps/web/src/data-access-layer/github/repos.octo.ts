import { getOctokit } from "@/lib/octokit";

export async function getRepositories(accessToken: string) {
  const octokit = getOctokit(accessToken);
  const { data } = await octokit.request("GET /user/repos", {
    per_page: 100,
    sort: "updated",
    direction: "desc",
  });
  return data;
}

export type RepositoryResponse = Awaited<ReturnType<typeof getRepositories>>[number];
