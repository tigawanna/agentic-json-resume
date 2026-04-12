import { Spinner } from "@/components/ui/spinner";
import { resumeDetailQueryOptions } from "@/data-access-layer/resume/resume-query-options";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const LazySavedResumeWorkbench = lazy(() =>
  import("./-components/SavedResumeWorkbench").then((m) => ({
    default: m.SavedResumeWorkbench,
  })),
);

export const Route = createFileRoute("/_dashboard/resumes/$resumeId/")({
  component: ResumeEditorPage,
  head: () => ({
    meta: [{ title: "Edit Resume", description: "Edit your saved resume" }],
  }),
});

function ResumeEditorPage() {
  const { resumeId } = Route.useParams();
  const { data: savedResume } = useSuspenseQuery(resumeDetailQueryOptions(resumeId));

  if (!savedResume) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-base-content/70">Resume not found.</p>
        <Button asChild variant="outline">
          <Link to="/resumes">Back to resumes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4" data-test="resume-editor-page">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/resumes">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">{savedResume.name}</h1>
      </div>
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center gap-2 text-base-content/70">
            <Spinner className="size-6" />
            <span>Loading editor...</span>
          </div>
        }
      >
        <LazySavedResumeWorkbench savedResume={savedResume} />
      </Suspense>
    </div>
  );
}
