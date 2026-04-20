import { volunteersCollection } from "@/data-access-layer/resume/volunteers/volunteer.collection";
import { deleteVolunteerMutationOptions } from "@/data-access-layer/resume/volunteers/volunteer.mutation-options";
import { ilike, or, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useMutation } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Route } from "..";
import { VolunteerListCard } from "./VolunteerListCard";

export function VolunteerList() {
  const { sq } = Route.useSearch();
  const { data: items } = useLiveSuspenseQuery(
    (q) => {
      let query = q.from({ volunteer: volunteersCollection });
      if (sq) {
        const pattern = `%${sq}%`;
        query = query.where(({ volunteer }) =>
          or(
            ilike(volunteer.organization, pattern),
            ilike(volunteer.role, pattern),
            ilike(volunteer.description, pattern),
          ),
        );
      }
      return query;
    },
    [sq],
  );
  const deleteMutation = useMutation(deleteVolunteerMutationOptions);
  return (
    <div className="flex w-full h-full flex-col gap-6" data-test="volunteer-list-page">
      <div className="flex-1" data-test="volunteer-list">
        {items.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center gap-4 py-16">
            <Heart className="text-muted-foreground size-12" />
            <p className="text-muted-foreground text-sm">
              No volunteer entries found. Add volunteer experience to your resumes first.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <VolunteerListCard
                key={item.id}
                volunteer={item}
                onDelete={(id) => {
                  volunteersCollection.utils.writeDelete(id);
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
