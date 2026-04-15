import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="flex w-full flex-col gap-8" data-test="dashboard-page">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-base-content/60 mt-1 text-sm">
          Your resume workspace — manage, tailor, and track every version.
        </p>
      </div>
    </div>
  );
}
