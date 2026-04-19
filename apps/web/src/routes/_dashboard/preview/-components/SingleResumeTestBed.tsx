import { resumeCollection } from "@/data-access-layer/resume/resumes-query-collection";
import { eq, useLiveQuery } from "@tanstack/react-db";

export default function SingleResumeTestBed() {
  const { data } = useLiveQuery((q) =>
    q
      .from({ resume: resumeCollection })
      .where(({ resume }) => eq(resume.id, "3d93e569-ef45-40de-9efa-6050d93fbea2")),
  );
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
