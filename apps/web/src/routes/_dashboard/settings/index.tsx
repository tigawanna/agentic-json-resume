import { ListPageHeader } from "@/components/wrappers/ListPageHeader";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/settings/")({
  component: SettingsPage,
  head: () => ({
    meta: [{ title: "Settings", description: "Manage your account and API keys" }],
  }),
});

function SettingsPage() {
  return (
    <div className="flex flex-col gap-8" data-test="settings-page">
      <ListPageHeader title="Settings" />
    </div>
  );
}
