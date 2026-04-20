import { talksCollection } from "@/data-access-layer/resume/talks/talk.collection";
import { deleteTalkMutationOptions } from "@/data-access-layer/resume/talks/talk.mutation-options";
import { ilike, or, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useMutation } from "@tanstack/react-query";
import { Mic } from "lucide-react";
import { Route } from "..";
import { TalkListCard } from "./TalkListCard";

export function TalkList() {
  const { sq } = Route.useSearch();
  const { data: items } = useLiveSuspenseQuery(
    (q) => {
      let query = q.from({ talk: talksCollection });
      if (sq) {
        const pattern = `%${sq}%`;
        query = query.where(({ talk }) =>
          or(
            ilike(talk.title, pattern),
            ilike(talk.event, pattern),
            ilike(talk.description, pattern),
          ),
        );
      }
      return query;
    },
    [sq],
  );
  const deleteMutation = useMutation(deleteTalkMutationOptions);
  return (
    <div className="flex w-full h-full flex-col gap-6" data-test="talk-list-page">
      <div className="flex-1" data-test="talk-list">
        {items.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center gap-4 py-16">
            <Mic className="text-muted-foreground size-12" />
            <p className="text-muted-foreground text-sm">
              No talks found. Add talks to your resumes first.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <TalkListCard
                key={item.id}
                talk={item}
                onDelete={(id) => {
                  talksCollection.utils.writeDelete(id);
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
