import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ResumeDTO } from "@/data-access-layer/resume/resume.types";
import { TEMPLATE_LABELS } from "@/features/resume/resume-schema";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { FileText, MoreVertical, Pencil, Trash2 } from "lucide-react";

interface ResumeCardProps {
  resume: ResumeDTO;
  onDelete: (id: string) => void;
}

export function ResumeCard({ resume, onDelete }: ResumeCardProps) {
  const templateLabel = TEMPLATE_LABELS[resume.data.meta.templateId] ?? "Classic";
  const timeAgo = formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true });

  return (
    <Card className="group relative transition-shadow hover:shadow-md" data-test="resume-card">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <Link
          to="/resumes/$resumeId"
          params={{ resumeId: resume.id }}
          className="flex min-w-0 flex-1 items-start gap-3"
        >
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">{resume.name}</CardTitle>
            {resume.description && (
              <CardDescription className="mt-0.5 line-clamp-2 text-xs">
                {resume.description}
              </CardDescription>
            )}
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/resumes/$resumeId" params={{ resumeId: resume.id }}>
                <Pencil className="mr-2 size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(resume.id)}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary" className="text-[10px]">
            {templateLabel}
          </Badge>
          <span className="text-base-content/50">{timeAgo}</span>
        </div>
        {resume.jobDescription && (
          <p className="text-base-content/60 mt-2 line-clamp-2 text-xs">{resume.jobDescription}</p>
        )}
      </CardContent>
    </Card>
  );
}
