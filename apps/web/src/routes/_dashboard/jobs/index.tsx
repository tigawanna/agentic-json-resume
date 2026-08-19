import { createFileRoute } from "@tanstack/react-router";
import { eventSourcedListSearchSchema } from "../-utils/list-search";
import { JobList } from "./-components/JobList";

export const Route = createFileRoute("/_dashboard/jobs/")({
  component: RouteComponent,
  ssr: false,
  validateSearch: (search) => eventSourcedListSearchSchema.parse(search),
  head: () => ({
    meta: [
      {
        title: "Jobs",
        description: "Track job postings independently from résumés.",
      },
    ],
  }),
});

function RouteComponent() {
  return <JobList />;
}
