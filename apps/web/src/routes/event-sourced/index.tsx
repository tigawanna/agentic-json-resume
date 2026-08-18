import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/event-sourced/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      Hello "/event-sour ced/"!
      <div className="w-full h-full flex items-center justify-center">
        Hello "/event-sour ced/"!
      </div>
      <div className="w-full h-full flex items-center justify-center">
        Hello "/event-sour ced/"!
      </div>
    </div>
  );
}
