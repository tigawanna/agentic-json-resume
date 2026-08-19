import { createFileRoute } from "@tanstack/react-router";
import { eventQueueSearchSchema } from "../-utils/list-search";
import { EventsView } from "./-components/EventsView";

export const Route = createFileRoute("/_dashboard/events/")({
  component: RouteComponent,
  ssr: false,
  validateSearch: (search) => eventQueueSearchSchema.parse(search),
  head: () => ({
    meta: [
      {
        title: "Events",
        description: "Inspect the local outbox, inbox, and dead-letter queues.",
      },
    ],
  }),
});

function RouteComponent() {
  return <EventsView />;
}
