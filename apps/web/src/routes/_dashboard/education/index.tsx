import { createFileRoute } from "@tanstack/react-router";
import { eventSourcedListSearchSchema } from "../-utils/list-search";
import { EducationList } from "./-components/EducationList";

export const Route = createFileRoute("/_dashboard/education/")({
  component: RouteComponent,
  ssr: false,
  validateSearch: (search) => eventSourcedListSearchSchema.parse(search),
  head: () => ({
    meta: [{ title: "Education", description: "Education entries in your local library." }],
  }),
});

function RouteComponent() {
  return <EducationList />;
}
