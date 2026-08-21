import { RouterNotFoundComponent } from "@/lib/tanstack/router/RouterNotFoundComponent";
import { RouterPendingComponent } from "@/lib/tanstack/router/RouterPendingComponent";
import { RouterErrorComponent } from "@/lib/tanstack/router/routerErrorComponent";
import { AppConfig } from "@/utils/system";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashoboard-sidebar/DashboardLayout";
import { EventSourcedDbProvider } from "@/data-access-layer/event-sourced/provider";
import {
  dashboard_account_routes,
  dashboard_admin_routes,
  getDashboardPrimaryRoutes,
} from "./-components/dashboard_routes";

export const Route = createFileRoute("/_dashboard")({
  pendingComponent: () => <RouterPendingComponent />,
  notFoundComponent: () => <RouterNotFoundComponent />,
  errorComponent: ({ error }) => <RouterErrorComponent error={error} />,
  component: DashboardShell,
  head: () => ({
    meta: [
      {
        title: `${AppConfig.name} | Dashboard`,
        description: "Your résumé JSON and PDF exports",
      },
    ],
  }),
});

function DashboardShell() {
  const primaryRoutes = getDashboardPrimaryRoutes();
  return (
    <EventSourcedDbProvider fallback={<RouterPendingComponent />}>
      <DashboardLayout
        sidebarRoutes={primaryRoutes}
        sidebarLabel="Menu"
        accountRoutes={dashboard_account_routes}
        accountLabel="Account"
        adminRoutes={dashboard_admin_routes}
        adminLabel="Administration"
      />
    </EventSourcedDbProvider>
  );
}
