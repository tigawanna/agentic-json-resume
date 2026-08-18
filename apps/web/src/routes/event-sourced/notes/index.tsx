import { createFileRoute } from "@tanstack/react-router";
import { eventSourcedListSearchSchema } from "../-utils/list-search";
import { NoteList } from "./-components/NoteList";

export const Route = createFileRoute("/event-sourced/notes/")({
  component: RouteComponent,
  ssr: false,
  validateSearch: (search) => eventSourcedListSearchSchema.parse(search),
  head: () => ({
    meta: [
      {
        title: "Notes",
        description: "Footer notes and condensed cover letters in your local library.",
      },
    ],
  }),
});

function RouteComponent() {
  return <NoteList />;
}
