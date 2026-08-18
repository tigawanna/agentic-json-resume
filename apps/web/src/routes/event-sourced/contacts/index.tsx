import { createFileRoute } from "@tanstack/react-router";
import { eventSourcedListSearchSchema } from "../-utils/list-search";
import { ContactList } from "./-components/ContactList";

export const Route = createFileRoute("/event-sourced/contacts/")({
  component: RouteComponent,
  ssr: false,
  validateSearch: (search) => eventSourcedListSearchSchema.parse(search),
  head: () => ({
    meta: [{ title: "Contacts", description: "Contact details in your local library." }],
  }),
});

function RouteComponent() {
  return <ContactList />;
}
