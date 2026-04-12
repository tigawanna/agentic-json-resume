import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";

export function ResumeEmptyState() {
  return (
    <Empty className="min-h-[50vh]" data-test="resume-empty-state">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText className="size-6" />
        </EmptyMedia>
        <EmptyTitle>No resumes yet</EmptyTitle>
        <EmptyDescription>
          Create your first resume and start tailoring it to different job descriptions. Each
          version is saved separately so you can track every application.
        </EmptyDescription>
      </EmptyHeader>
      <Button asChild>
        <Link to="/resumes/create">
          <Plus className="mr-2 size-4" />
          Create your first resume
        </Link>
      </Button>
    </Empty>
  );
}
