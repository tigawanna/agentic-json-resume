import { SidebarItem } from "@/components/sidebar/types";
import {
  Award,
  Briefcase,
  Contact,
  FileText,
  FolderGit2,
  FolderKanban,
  Github,
  Globe,
  GraduationCap,
  Heart,
  LayoutDashboard,
  Link,
  Mic,
  Notebook,
  Settings,
  StickyNote,
  Wrench,
} from "lucide-react";

export const dashboard_account_routes = [
  { title: "Settings", href: "/settings", icon: Settings },
] satisfies SidebarItem[];

export const dashboard_admin_routes = [] satisfies SidebarItem[];

export function getDashboardPrimaryRoutes(): SidebarItem[] {
  return [
    { title: "Dashboard", href: "/event-sourced", icon: LayoutDashboard },
    { title: "Resumes", href: "/event-sourced/resumes", icon: FileText },
    {
      title: "Resume Data",
      href: "/event-sourced/experiences",
      icon: Briefcase,
      sublinks: [
        { title: "Experiences", href: "/event-sourced/experiences", icon: Briefcase },
        { title: "Education", href: "/event-sourced/education", icon: GraduationCap },
        { title: "Projects", href: "/event-sourced/resume-projects", icon: FolderKanban },
        { title: "Skills", href: "/event-sourced/skill-groups", icon: Wrench },
        { title: "Certifications", href: "/event-sourced/certifications", icon: Award },
        { title: "Talks", href: "/event-sourced/talks", icon: Mic },
        { title: "Volunteers", href: "/event-sourced/volunteers", icon: Heart },
        { title: "Languages", href: "/event-sourced/languages", icon: Globe },
        { title: "Contacts", href: "/event-sourced/contacts", icon: Contact },
        { title: "Links", href: "/event-sourced/links", icon: Link },
        { title: "Summaries", href: "/event-sourced/summaries", icon: StickyNote },
        { title: "Notes", href: "/event-sourced/notes", icon: Notebook },
      ],
    },
    { title: "Repositories", href: "/event-sourced/repos", icon: Github },
    { title: "Saved Projects", href: "/event-sourced/saved-projects", icon: FolderGit2 },
  ];
}

export const dashboard_routes = [
  ...getDashboardPrimaryRoutes(),
  ...dashboard_account_routes,
  ...dashboard_admin_routes,
] satisfies SidebarItem[];
