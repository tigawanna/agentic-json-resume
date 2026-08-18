import { createFileRoute, redirect } from "@tanstack/react-router";
import { RouterPendingComponent } from "@/lib/tanstack/router/RouterPendingComponent";
import { RouterNotFoundComponent } from "@/lib/tanstack/router/RouterNotFoundComponent";
import { RouterErrorComponent } from "@/lib/tanstack/router/routerErrorComponent";
import { viewerMiddleware } from "@/data-access-layer/auth/viewer";
import { AppConfig } from "@/utils/system";
import {
  dashboard_account_routes,
  dashboard_admin_routes,
  getDashboardPrimaryRoutes,
} from "./-component/dashboard_routes";
import { DashboardLayout } from "@/components/dashoboard-sidebar/DashboardLayout";

export const Route = createFileRoute("/event-sourced")({
  pendingComponent: () => <RouterPendingComponent />,
  notFoundComponent: () => <RouterNotFoundComponent />,
  errorComponent: ({ error }) => <RouterErrorComponent error={error} />,
  server: {
    middleware: [viewerMiddleware],
  },
  component: RouteComponent,
  beforeLoad: async ({ context, serverContext }) => {
    if (!serverContext?.isServer && !context.viewer?.user) {
      throw redirect({ to: "/auth", search: { returnTo: location.pathname } });
    }
  },
  head: () => ({
    meta: [
      {
        title: `${AppConfig.name} | Event Sourced`,
        description: "Your résumé JSON and PDF exports",
      },
    ],
  }),
});

function RouteComponent() {
  const primaryRoutes = getDashboardPrimaryRoutes();
  return (
    <DashboardLayout
      sidebarRoutes={primaryRoutes}
      sidebarLabel="Menu"
      accountRoutes={dashboard_account_routes}
      accountLabel="Account"
      adminRoutes={dashboard_admin_routes}
      adminLabel="Administration"
    />
  );
}
