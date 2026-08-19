import { createFileRoute } from "@tanstack/react-router";
import { eventSourcedListSearchSchema } from "../-utils/list-search";
import { LanguageList } from "./-components/LanguageList";

export const Route = createFileRoute("/_dashboard/languages/")({
  component: RouteComponent,
  ssr: false,
  validateSearch: (search) => eventSourcedListSearchSchema.parse(search),
  head: () => ({
    meta: [
      {
        title: "Languages",
        description: "Languages in your local library (not yet attached to a résumé).",
      },
    ],
  }),
});

function RouteComponent() {
  return <LanguageList />;
}
