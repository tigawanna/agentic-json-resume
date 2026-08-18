import { Button } from "@/components/ui/button";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { Loader } from "lucide-react";

export const Route = createFileRoute("/event-sourced/")({
  component: RouteComponent,
});

function RouteComponent() {
  const db = useEventSourcedDb();
  const { data: resumes, isLoading } = useLiveQuery((q) =>
    q.from({ resumes: db.collections.resume }),
  );
  if (isLoading)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin" />
      </div>
    );
  if (!resumes || resumes.length === 0)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">No resumes found</div>
        <Button>Create Resume</Button>
      </div>
    );

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full flex items-center justify-center">
        {resumes?.map((resume) => (
          <div key={resume.id} className="w-full h-full flex items-center justify-center">
            <h1>
              {resume.name} {resume.headline}
            </h1>
          </div>
        ))}
      </div>
    </div>
  );
}
