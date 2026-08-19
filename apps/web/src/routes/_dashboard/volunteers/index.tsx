import { createFileRoute } from "@tanstack/react-router";
import { eventSourcedListSearchSchema } from "../-utils/list-search";
import { VolunteerList } from "./-components/VolunteerList";

export const Route = createFileRoute("/_dashboard/volunteers/")({
  component: RouteComponent,
  ssr: false,
  validateSearch: (search) => eventSourcedListSearchSchema.parse(search),
  head: () => ({
    meta: [{ title: "Volunteers", description: "Volunteer roles in your local library." }],
  }),
});

function RouteComponent() {
  return <VolunteerList />;
}
