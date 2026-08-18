import { createFileRoute } from "@tanstack/react-router";
import { eventSourcedListSearchSchema } from "../-utils/list-search";
import { LinkList } from "./-components/LinkList";

export const Route = createFileRoute("/event-sourced/links/")({
  component: RouteComponent,
  ssr: false,
  validateSearch: (search) => eventSourcedListSearchSchema.parse(search),
  head: () => ({
    meta: [{ title: "Links", description: "Profile and portfolio links in your local library." }],
  }),
});

function RouteComponent() {
  return <LinkList />;
}
