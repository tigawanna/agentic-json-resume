import { createFileRoute } from "@tanstack/react-router";
import { eventSourcedListSearchSchema } from "../-utils/list-search";
import { ProjectList } from "./-components/ProjectList";

export const Route = createFileRoute("/event-sourced/resume-projects/")({
  component: RouteComponent,
  ssr: false,
  validateSearch: (search) => eventSourcedListSearchSchema.parse(search),
  head: () => ({
    meta: [{ title: "Projects", description: "Projects in your local library." }],
  }),
});

function RouteComponent() {
  return <ProjectList />;
}
