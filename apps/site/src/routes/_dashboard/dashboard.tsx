import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resumeListQueryOptions } from "@/data-access-layer/resume/resume-query-options";
import type { ResumeDTO } from "@/data-access-layer/resume/resume.types";
import { TEMPLATE_LABELS } from "@/features/resume/resume-schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, FileText, Plus, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_dashboard/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: resumes } = useSuspenseQuery(resumeListQueryOptions);
  const recentResumes = resumes.slice(0, 3);

  return (
    <div className="flex w-full flex-col gap-8" data-test="dashboard-page">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-base-content/60 mt-1 text-sm">
          Your resume workspace — manage, tailor, and track every version.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total resumes"
          value={resumes.length}
          description={resumes.length === 1 ? "resume saved" : "resumes saved"}
          icon={<FileText className="size-5" />}
        />
        <StatsCard
          title="Latest update"
          value={
            resumes[0]
              ? formatDistanceToNow(new Date(resumes[0].updatedAt), { addSuffix: true })
              : "—"
          }
          description={resumes[0]?.name ?? "No resumes yet"}
          icon={<Sparkles className="size-5" />}
        />
        <Card className="flex flex-col items-center justify-center gap-3 p-6">
          <p className="text-base-content/70 text-center text-sm">Ready to tailor a new resume?</p>
          <Button asChild>
            <Link to="/resumes/create">
              <Plus className="mr-2 size-4" />
              Create resume
            </Link>
          </Button>
        </Card>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent resumes</h2>
          {resumes.length > 0 && (
            <Button variant="ghost" size="sm" asChild className="gap-1.5">
              <Link to="/resumes">
                View all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>

        {recentResumes.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 p-10">
            <FileText className="text-base-content/30 size-10" />
            <div className="text-center">
              <p className="font-medium">No resumes yet</p>
              <p className="text-base-content/60 mt-1 text-sm">
                Create your first resume and start tailoring it to different roles.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/resumes/create">
                <Plus className="mr-2 size-4" />
                Get started
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentResumes.map((resume) => (
              <RecentResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title="Create new resume"
            description="Start from scratch or clone an existing one"
            href="/resumes/create"
            icon={<Plus className="size-5" />}
          />
          <QuickActionCard
            title="Browse resumes"
            description="View and manage all your saved resumes"
            href="/resumes"
            icon={<FileText className="size-5" />}
          />
          <QuickActionCard
            title="Open builder"
            description="Use the standalone editor without saving"
            href="/resume"
            icon={<Sparkles className="size-5" />}
          />
        </div>
      </section>
    </div>
  );
}

function StatsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-base-content/50">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-base-content/60 text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}

function RecentResumeCard({ resume }: { resume: ResumeDTO }) {
  const templateLabel = TEMPLATE_LABELS[resume.data.meta.templateId] ?? "Classic";
  const timeAgo = formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true });

  return (
    <Link to="/resumes/$resumeId" params={{ resumeId: resume.id }} className="group">
      <Card className="transition-shadow group-hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-sm">{resume.name}</CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {templateLabel} · {timeAgo}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {resume.description && (
          <CardContent className="pt-0">
            <p className="text-base-content/60 line-clamp-2 text-xs">{resume.description}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link to={href} className="group">
      <Card className="transition-all group-hover:shadow-md group-hover:border-primary/30">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="bg-base-200 group-hover:bg-primary/10 group-hover:text-primary flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-base-content/60 mt-0.5 text-xs">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
