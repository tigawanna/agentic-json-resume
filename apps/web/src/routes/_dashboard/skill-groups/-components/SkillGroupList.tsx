import { skillGroupsCollection } from "@/data-access-layer/resume/skill-groups/skill-group.collection";
import { deleteSkillGroupMutationOptions } from "@/data-access-layer/resume/skill-groups/skill-group.mutation-options";
import { ilike, or, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useMutation } from "@tanstack/react-query";
import { Layers } from "lucide-react";
import { Route } from "..";
import { SkillGroupListCard } from "./SkillGroupListCard";

export function SkillGroupList() {
  const { sq } = Route.useSearch();
  const { data: items } = useLiveSuspenseQuery(
    (q) => {
      let query = q.from({ skillGroup: skillGroupsCollection });
      if (sq) {
        const pattern = `%${sq}%`;
        query = query.where(({ skillGroup }) =>
          or(ilike(skillGroup.name, pattern), ilike(skillGroup.skills, pattern)),
        );
      }
      return query;
    },
    [sq],
  );
  const deleteMutation = useMutation(deleteSkillGroupMutationOptions);
  return (
    <div className="flex w-full h-full flex-col gap-6" data-test="skill-group-list-page">
      <div className="flex-1" data-test="skill-group-list">
        {items.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center gap-4 py-16">
            <Layers className="text-muted-foreground size-12" />
            <p className="text-muted-foreground text-sm">
              No skill groups found. Add skills to your resumes first.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <SkillGroupListCard
                key={item.id}
                skillGroup={item}
                onDelete={(id) => {
                  skillGroupsCollection.utils.writeDelete(id);
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
