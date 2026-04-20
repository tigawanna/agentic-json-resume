import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
const TestList = lazy(() => import("./-components/TestList"));

export const Route = createFileRoute("/test/")({
  component: RouteComponent,
  ssr: false,
  head: () => ({
    meta: [{ title: "Test Route", description: "A test route for development" }],
  }),
});

function RouteComponent() {
  return (
    <div>
      <TestList />
    </div>
  );
}
