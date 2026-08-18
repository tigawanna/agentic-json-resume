import { Button } from "@/components/ui/button";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { count, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Briefcase,
  Contact,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  Heart,
  Link as LinkIcon,
  Loader,
  Mic,
  StickyNote,
  Wrench,
} from "lucide-react";

export const Route = createFileRoute("/event-sourced/")({
  component: RouteComponent,
  ssr: false,
  head: () => ({
    meta: [
      {
        title: "Event Sourced Dashboard",
        description: "Local-first résumé library powered by event-sourced collections",
      },
    ],
  }),
});

const libraryLinks = [
  { title: "Résumés", href: "/event-sourced/resumes", icon: FileText, countKey: "resume" as const },
  {
    title: "Experiences",
    href: "/event-sourced/experiences",
    icon: Briefcase,
    countKey: "resumeExperience" as const,
  },
  {
    title: "Education",
    href: "/event-sourced/education",
    icon: GraduationCap,
    countKey: "resumeEducation" as const,
  },
  {
    title: "Projects",
    href: "/event-sourced/resume-projects",
    icon: FolderKanban,
    countKey: "resumeProject" as const,
  },
  {
    title: "Skills",
    href: "/event-sourced/skill-groups",
    icon: Wrench,
    countKey: "resumeSkillGroup" as const,
  },
  {
    title: "Certifications",
    href: "/event-sourced/certifications",
    icon: Award,
    countKey: "resumeCertification" as const,
  },
  { title: "Talks", href: "/event-sourced/talks", icon: Mic, countKey: "resumeTalk" as const },
  {
    title: "Volunteers",
    href: "/event-sourced/volunteers",
    icon: Heart,
    countKey: "resumeVolunteer" as const,
  },
  {
    title: "Languages",
    href: "/event-sourced/languages",
    icon: Globe,
    countKey: "resumeLanguage" as const,
  },
  {
    title: "Contacts",
    href: "/event-sourced/contacts",
    icon: Contact,
    countKey: "resumeContact" as const,
  },
  { title: "Links", href: "/event-sourced/links", icon: LinkIcon, countKey: "resumeLink" as const },
  {
    title: "Summaries",
    href: "/event-sourced/summaries",
    icon: StickyNote,
    countKey: "resumeSummary" as const,
  },
];

function RouteComponent() {
  const db = useEventSourcedDb();
  const { data: resumeTotals, isLoading: resumesLoading } = useLiveQuery((q) =>
    q.from({ row: db.collections.resume }).select(({ row }) => ({ total: count(row.id) })),
  );
  const { data: experienceTotals } = useLiveQuery((q) =>
    q
      .from({ row: db.collections.resumeExperience })
      .select(({ row }) => ({ total: count(row.id) })),
  );
  const { data: educationTotals } = useLiveQuery((q) =>
    q.from({ row: db.collections.resumeEducation }).select(({ row }) => ({ total: count(row.id) })),
  );
  const { data: projectTotals } = useLiveQuery((q) =>
    q.from({ row: db.collections.resumeProject }).select(({ row }) => ({ total: count(row.id) })),
  );
  const { data: skillGroupTotals } = useLiveQuery((q) =>
    q
      .from({ row: db.collections.resumeSkillGroup })
      .select(({ row }) => ({ total: count(row.id) })),
  );
  const { data: certificationTotals } = useLiveQuery((q) =>
    q
      .from({ row: db.collections.resumeCertification })
      .select(({ row }) => ({ total: count(row.id) })),
  );
  const { data: talkTotals } = useLiveQuery((q) =>
    q.from({ row: db.collections.resumeTalk }).select(({ row }) => ({ total: count(row.id) })),
  );
  const { data: volunteerTotals } = useLiveQuery((q) =>
    q.from({ row: db.collections.resumeVolunteer }).select(({ row }) => ({ total: count(row.id) })),
  );
  const { data: languageTotals } = useLiveQuery((q) =>
    q.from({ row: db.collections.resumeLanguage }).select(({ row }) => ({ total: count(row.id) })),
  );
  const { data: contactTotals } = useLiveQuery((q) =>
    q.from({ row: db.collections.resumeContact }).select(({ row }) => ({ total: count(row.id) })),
  );
  const { data: linkTotals } = useLiveQuery((q) =>
    q.from({ row: db.collections.resumeLink }).select(({ row }) => ({ total: count(row.id) })),
  );
  const { data: summaryTotals } = useLiveQuery((q) =>
    q.from({ row: db.collections.resumeSummary }).select(({ row }) => ({ total: count(row.id) })),
  );

  const counts = {
    resume: resumeTotals?.[0]?.total ?? 0,
    resumeExperience: experienceTotals?.[0]?.total ?? 0,
    resumeEducation: educationTotals?.[0]?.total ?? 0,
    resumeProject: projectTotals?.[0]?.total ?? 0,
    resumeSkillGroup: skillGroupTotals?.[0]?.total ?? 0,
    resumeCertification: certificationTotals?.[0]?.total ?? 0,
    resumeTalk: talkTotals?.[0]?.total ?? 0,
    resumeVolunteer: volunteerTotals?.[0]?.total ?? 0,
    resumeLanguage: languageTotals?.[0]?.total ?? 0,
    resumeContact: contactTotals?.[0]?.total ?? 0,
    resumeLink: linkTotals?.[0]?.total ?? 0,
    resumeSummary: summaryTotals?.[0]?.total ?? 0,
  };

  if (resumesLoading) {
    return (
      <div className="flex h-full min-h-64 w-full items-center justify-center">
        <Loader className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8" data-test="event-sourced-dashboard">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Local library</h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">
            CRUD the résumé building blocks against your event-sourced collections. Sync is off for
            now — everything stays on this device.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/event-sourced/resumes">
            <FileText className="mr-1 size-4" />
            Open résumés
          </Link>
        </Button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {libraryLinks.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                className="border-border hover:bg-muted/40 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors"
                data-test={`library-link-${item.countKey}`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Icon className="text-muted-foreground size-4 shrink-0" />
                  <span className="truncate text-sm font-medium">{item.title}</span>
                </span>
                <span className="text-muted-foreground tabular-nums text-sm">
                  {counts[item.countKey]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
