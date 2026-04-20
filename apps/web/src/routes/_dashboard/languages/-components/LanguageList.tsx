import { languagesCollection } from "@/data-access-layer/resume/languages/language.collection";
import { deleteLanguageMutationOptions } from "@/data-access-layer/resume/languages/language.mutation-options";
import { ilike, or, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useMutation } from "@tanstack/react-query";
import { Globe } from "lucide-react";
import { Route } from "..";
import { LanguageListCard } from "./LanguageListCard";

export function LanguageList() {
  const { sq } = Route.useSearch();
  const { data: items } = useLiveSuspenseQuery(
    (q) => {
      let query = q.from({ language: languagesCollection });
      if (sq) {
        const pattern = `%${sq}%`;
        query = query.where(({ language }) =>
          or(ilike(language.name, pattern), ilike(language.proficiency, pattern)),
        );
      }
      return query;
    },
    [sq],
  );
  const deleteMutation = useMutation(deleteLanguageMutationOptions);
  return (
    <div className="flex w-full h-full flex-col gap-6" data-test="language-list-page">
      <div className="flex-1" data-test="language-list">
        {items.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center gap-4 py-16">
            <Globe className="text-muted-foreground size-12" />
            <p className="text-muted-foreground text-sm">
              No languages found. Add languages to your resumes first.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <LanguageListCard
                key={item.id}
                language={item}
                onDelete={(id) => {
                  languagesCollection.utils.writeDelete(id);
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
