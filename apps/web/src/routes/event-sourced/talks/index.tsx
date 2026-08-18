import { createFileRoute } from "@tanstack/react-router";
import { eventSourcedListSearchSchema } from "../-utils/list-search";
import { TalkList } from "./-components/TalkList";

export const Route = createFileRoute("/event-sourced/talks/")({
  component: RouteComponent,
  ssr: false,
  validateSearch: (search) => eventSourcedListSearchSchema.parse(search),
  head: () => ({
    meta: [{ title: "Talks", description: "Talks and presentations in your local library." }],
  }),
});

function RouteComponent() {
  return <TalkList />;
}
