import { createFileRoute } from "@tanstack/react-router";
import { eventSourcedListSearchSchema } from "../-utils/list-search";
import { SkillGroupList } from "./-components/SkillGroupList";

export const Route = createFileRoute("/event-sourced/skill-groups/")({
  component: RouteComponent,
  ssr: false,
  validateSearch: (search) => eventSourcedListSearchSchema.parse(search),
  head: () => ({
    meta: [{ title: "Skills", description: "Skill groups in your local library." }],
  }),
});

function RouteComponent() {
  return <SkillGroupList />;
}
