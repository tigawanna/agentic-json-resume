import { PublicResumeShell } from "./-components/PublicResumeShell";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public")({
  ssr: false,
  component: PublicResumeShell,
});
