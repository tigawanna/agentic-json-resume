import { createFileRoute } from "@tanstack/react-router";
import { eventSourcedListSearchSchema } from "../-utils/list-search";
import { PublicResumeList } from "./-components/PublicResumeList";

export const Route = createFileRoute("/_dashboard/public-resumes/")({
  component: RouteComponent,
  validateSearch: (search) => eventSourcedListSearchSchema.parse(search),
  head: () => ({
    meta: [
      {
        title: "Public résumés",
        description: "Manage résumés you have published for sharing.",
      },
    ],
  }),
});

function RouteComponent() {
  return <PublicResumeList />;
}
