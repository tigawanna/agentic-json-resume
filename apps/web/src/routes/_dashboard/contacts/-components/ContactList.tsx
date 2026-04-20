import { contactsCollection } from "@/data-access-layer/resume/contacts/contact.collection";
import { deleteContactMutationOptions } from "@/data-access-layer/resume/contacts/contact.mutation-options";
import { ilike, or, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useMutation } from "@tanstack/react-query";
import { Contact } from "lucide-react";
import { Route } from "..";
import { ContactListCard } from "./ContactListCard";

export function ContactList() {
  const { sq } = Route.useSearch();
  const { data: items } = useLiveSuspenseQuery(
    (q) => {
      let query = q.from({ contact: contactsCollection });
      if (sq) {
        const pattern = `%${sq}%`;
        query = query.where(({ contact }) =>
          or(
            ilike(contact.type, pattern),
            ilike(contact.value, pattern),
            ilike(contact.label, pattern),
          ),
        );
      }
      return query;
    },
    [sq],
  );
  const deleteMutation = useMutation(deleteContactMutationOptions);
  return (
    <div className="flex w-full h-full flex-col gap-6" data-test="contact-list-page">
      <div className="flex-1" data-test="contact-list">
        {items.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center gap-4 py-16">
            <Contact className="text-muted-foreground size-12" />
            <p className="text-muted-foreground text-sm">
              No contacts found. Add contact information to your resumes first.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ContactListCard
                key={item.id}
                contact={item}
                onDelete={(id) => {
                  contactsCollection.utils.writeDelete(id);
                  deleteMutation.mutate(id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
