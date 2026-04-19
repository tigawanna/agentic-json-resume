import { resumeCollection } from "@/data-access-layer/resume/resumes-query-collection";
import { eq, useLiveQuery } from "@tanstack/react-db";

export default function SingleResumeTestBed() {
  const { data, isLoading } = useLiveQuery((q) =>
    q
      .from({ resume: resumeCollection })
      .where(({ resume }) => eq(resume.id, "3d93e569-ef45-40de-9efa-6050d93fbea2"))
      .findOne(),
  );

  if (isLoading) {
    return <p>Loading...</p>;
  }
  if (!data) {
    return <p>No resume found.</p>;
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-10">
      <h3 className="text-lg font-semibold mb-4">Resume Data:</h3>
      <pre className="p-4 rounded w-full h-full overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
