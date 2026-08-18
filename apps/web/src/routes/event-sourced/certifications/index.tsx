import { createFileRoute } from "@tanstack/react-router";
import { eventSourcedListSearchSchema } from "../-utils/list-search";
import { CertificationList } from "./-components/CertificationList";

export const Route = createFileRoute("/event-sourced/certifications/")({
  component: RouteComponent,
  ssr: false,
  validateSearch: (search) => eventSourcedListSearchSchema.parse(search),
  head: () => ({
    meta: [{ title: "Certifications", description: "Certifications in your local library." }],
  }),
});

function RouteComponent() {
  return <CertificationList />;
}
