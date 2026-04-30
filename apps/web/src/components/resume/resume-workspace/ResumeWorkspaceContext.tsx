import { createContext, useContext } from "react";
import type { ResumeWorkspaceAdapter } from "./resume-workspace-types";

const ResumeWorkspaceContext = createContext<ResumeWorkspaceAdapter | null>(null);

export function ResumeWorkspaceProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ResumeWorkspaceAdapter;
}) {
  return <ResumeWorkspaceContext value={value}>{children}</ResumeWorkspaceContext>;
}

export function useResumeWorkspace() {
  const workspace = useContext(ResumeWorkspaceContext);
  if (!workspace) {
    throw new Error("Resume workspace context is missing");
  }
  return workspace;
}
