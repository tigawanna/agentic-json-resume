import { createFileRoute } from "@tanstack/react-router";
import { eventSourcedListSearchSchema } from "../-utils/list-search";
import { ResumeList } from "./-components/ResumeList";

export const Route = createFileRoute("/_dashboard/resumes/")({
  component: RouteComponent,
  ssr: false,
  validateSearch: (search) => eventSourcedListSearchSchema.parse(search),
  head: () => ({
    meta: [
      {
        title: "Résumés",
        description: "Local-first résumés stored in your event-sourced collection.",
      },
    ],
  }),
});

function RouteComponent() {
  return <ResumeList />;
}
