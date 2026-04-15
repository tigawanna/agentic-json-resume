import { Spinner } from "@/components/ui/spinner";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const LazyResumeWorkbench = lazy(() =>
  import("./-components/ResumeWorkbench").then((m) => ({ default: m.ResumeWorkbench })),
);

export const Route = createFileRoute("/_public/resume/")({
  ssr: false,
  component: ResumePage,
  head: () => ({
    meta: [
      {
        title: "Résumé builder",
        description: "JSON résumé editor, preview, diff, and PDF export",
      },
    ],
  }),
});

function ResumePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center gap-2 text-base-content/70">
          <Spinner className="size-6" />
          <span>Loading builder…</span>
        </div>
      }
    >
      <LazyResumeWorkbench />
    </Suspense>
  );
}
