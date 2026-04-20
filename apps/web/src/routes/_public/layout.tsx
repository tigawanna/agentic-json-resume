import { RouterErrorComponent } from "@/lib/tanstack/router/routerErrorComponent";
import { RouterNotFoundComponent } from "@/lib/tanstack/router/RouterNotFoundComponent";
import { RouterPendingComponent } from "@/lib/tanstack/router/RouterPendingComponent";
import { PublicResumeShell } from "./-components/PublicResumeShell";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public")({
  ssr: false,
  component: PublicResumeShell,
  pendingComponent: () => <RouterPendingComponent />,
  notFoundComponent: () => <RouterNotFoundComponent />,
  errorComponent: ({ error }) => <RouterErrorComponent error={error} />,
});
