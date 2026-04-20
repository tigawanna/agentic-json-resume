import { createFileRoute } from "@tanstack/react-router";
import { ReposPage } from "./-components/ReposPage";

export const Route = createFileRoute("/_dashboard/repos/")({
  component: ReposPage,
  ssr: false,
  head: () => ({
    meta: [
      {
        title: "GitHub Repositories",
        description: "Browse and shortlist your GitHub repositories",
      },
    ],
  }),
});
