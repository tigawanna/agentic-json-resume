import { createFileRoute } from "@tanstack/react-router";
import { eventSourcedListSearchSchema } from "../-utils/list-search";
import { SummaryList } from "./-components/SummaryList";

export const Route = createFileRoute("/_dashboard/summaries/")({
  component: RouteComponent,
  ssr: false,
  validateSearch: (search) => eventSourcedListSearchSchema.parse(search),
  head: () => ({
    meta: [{ title: "Summaries", description: "Professional summaries in your local library." }],
  }),
});

function RouteComponent() {
  return <SummaryList />;
}
