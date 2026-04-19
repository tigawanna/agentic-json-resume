import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const SingleResumeTestBed = lazy(() => import("./-components/SingleResumeTestBed"));

export const Route = createFileRoute("/_dashboard/preview/")({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Preview</h1>
        <p className="text-base-content/60 text-sm">
          This page is for previewing new features and testing things out. It is not meant to be a
          permanent page.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Single Resume Test Bed</h2>
        <div className="w-full h-96 border rounded">
          <SingleResumeTestBed />
        </div>
      </div>
    </div>
  );
}
