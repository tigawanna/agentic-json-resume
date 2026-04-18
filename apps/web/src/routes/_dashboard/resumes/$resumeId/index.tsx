import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resumeDetailQueryOptions } from "@/data-access-layer/resume/resume-query-options";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ResumeEditTab } from "./-components/ResumeEditTab";
import { ResumeJsonTab } from "./-components/ResumeJsonTab";
import { ResumePreviewTab } from "./-components/ResumePreviewTab";

export const Route = createFileRoute("/_dashboard/resumes/$resumeId/")({
  component: ResumeWorkbench,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(resumeDetailQueryOptions(params.resumeId)),
  head: () => ({
    meta: [{ title: "Edit Resume", description: "Resume workbench" }],
  }),
});

function ResumeWorkbench() {
  const { resumeId } = Route.useParams();
  const { data: resume } = useSuspenseQuery(resumeDetailQueryOptions(resumeId));

  if (!resume) {
    return <p className="text-muted-foreground py-8 text-center">Resume not found.</p>;
  }

  return (
    <div className="flex w-full flex-col gap-4" data-test="resume-workbench">
      <div>
        <h1 className="text-2xl font-bold">{resume.name}</h1>
        {resume.headline && <p className="text-muted-foreground mt-1 text-sm">{resume.headline}</p>}
      </div>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-4">
          <ResumeEditTab resume={resume} />
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <ResumePreviewTab resume={resume} />
        </TabsContent>

        <TabsContent value="json" className="mt-4">
          <ResumeJsonTab resume={resume} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
