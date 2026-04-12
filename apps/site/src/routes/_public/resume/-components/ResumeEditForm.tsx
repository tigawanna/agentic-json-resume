import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createDefaultResume,
  moveSectionOrder,
  type ResumeDocumentV1,
  type SectionKey,
} from "@/features/resume/resume-schema";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

const SECTION_LABELS: Record<SectionKey, string> = {
  header: "Profile",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
};

export function ResumeEditForm({
  doc,
  onChange,
}: {
  doc: ResumeDocumentV1;
  onChange: (next: ResumeDocumentV1) => void;
}) {
  function set<K extends keyof ResumeDocumentV1>(key: K, value: ResumeDocumentV1[K]) {
    onChange({ ...doc, [key]: value });
  }

  return (
    <div className="flex flex-col gap-6" data-test="resume-edit-form">
      <Card>
        <CardHeader>
          <CardTitle>Section order</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {doc.sectionOrder.map((key) => (
            <div
              key={key}
              className="bg-base-200 flex items-center justify-between gap-2 rounded-md border px-3 py-2"
            >
              <span className="text-sm font-medium">{SECTION_LABELS[key]}</span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={() => set("sectionOrder", moveSectionOrder(doc.sectionOrder, key, -1))}
                  aria-label="Move section up"
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={() => set("sectionOrder", moveSectionOrder(doc.sectionOrder, key, 1))}
                  aria-label="Move section down"
                >
                  <ChevronDown className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="en-header">On</Label>
            <Switch
              id="en-header"
              checked={doc.header.enabled}
              onCheckedChange={(v) => set("header", { ...doc.header, enabled: v })}
            />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={doc.header.fullName}
              onChange={(e) => set("header", { ...doc.header, fullName: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={doc.header.headline}
              onChange={(e) => set("header", { ...doc.header, headline: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={doc.header.email}
              onChange={(e) => set("header", { ...doc.header, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={doc.header.location}
              onChange={(e) => set("header", { ...doc.header, location: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <Label>Links</Label>
            {doc.header.links.map((link, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => {
                    const links = [...doc.header.links];
                    const cur = links[i];
                    if (cur) links[i] = { ...cur, label: e.target.value };
                    set("header", { ...doc.header, links });
                  }}
                />
                <Input
                  placeholder="https://"
                  value={link.url}
                  onChange={(e) => {
                    const links = [...doc.header.links];
                    const cur = links[i];
                    if (cur) links[i] = { ...cur, url: e.target.value };
                    set("header", { ...doc.header, links });
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    set("header", {
                      ...doc.header,
                      links: doc.header.links.filter((_, j) => j !== i),
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() =>
                set("header", {
                  ...doc.header,
                  links: [...doc.header.links, { label: "", url: "" }],
                })
              }
            >
              <Plus className="size-4" />
              Add link
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Summary</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="en-sum">On</Label>
            <Switch
              id="en-sum"
              checked={doc.summary.enabled}
              onCheckedChange={(v) => set("summary", { ...doc.summary, enabled: v })}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={5}
            value={doc.summary.text}
            onChange={(e) => set("summary", { ...doc.summary, text: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Experience</CardTitle>
          <Switch
            checked={doc.experience.enabled}
            onCheckedChange={(v) => set("experience", { ...doc.experience, enabled: v })}
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {doc.experience.items.map((ex, i) => (
            <div key={i} className="border-base-300 space-y-3 rounded-lg border p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={ex.company}
                    onChange={(e) => {
                      const items = [...doc.experience.items];
                      const cur = items[i];
                      if (cur) items[i] = { ...cur, company: e.target.value };
                      set("experience", { ...doc.experience, items });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={ex.role}
                    onChange={(e) => {
                      const items = [...doc.experience.items];
                      const cur = items[i];
                      if (cur) items[i] = { ...cur, role: e.target.value };
                      set("experience", { ...doc.experience, items });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start</Label>
                  <Input
                    value={ex.start}
                    onChange={(e) => {
                      const items = [...doc.experience.items];
                      const cur = items[i];
                      if (cur) items[i] = { ...cur, start: e.target.value };
                      set("experience", { ...doc.experience, items });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End</Label>
                  <Input
                    value={ex.end}
                    onChange={(e) => {
                      const items = [...doc.experience.items];
                      const cur = items[i];
                      if (cur) items[i] = { ...cur, end: e.target.value };
                      set("experience", { ...doc.experience, items });
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bullets (one per line)</Label>
                <Textarea
                  rows={4}
                  value={ex.bullets.join("\n")}
                  onChange={(e) => {
                    const items = [...doc.experience.items];
                    const cur = items[i];
                    if (cur)
                      items[i] = {
                        ...cur,
                        bullets: e.target.value.split("\n").filter(Boolean),
                      };
                    set("experience", { ...doc.experience, items });
                  }}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  set("experience", {
                    ...doc.experience,
                    items: doc.experience.items.filter((_, j) => j !== i),
                  })
                }
              >
                Remove role
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              set("experience", {
                ...doc.experience,
                items: [
                  ...doc.experience.items,
                  {
                    company: "",
                    role: "",
                    start: "",
                    end: "",
                    bullets: [],
                  },
                ],
              })
            }
          >
            Add experience
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Education</CardTitle>
          <Switch
            checked={doc.education.enabled}
            onCheckedChange={(v) => set("education", { ...doc.education, enabled: v })}
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {doc.education.items.map((ed, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-3">
              <Input
                placeholder="School"
                value={ed.school}
                onChange={(e) => {
                  const items = [...doc.education.items];
                  const cur = items[i];
                  if (cur) items[i] = { ...cur, school: e.target.value };
                  set("education", { ...doc.education, items });
                }}
              />
              <Input
                placeholder="Degree"
                value={ed.degree}
                onChange={(e) => {
                  const items = [...doc.education.items];
                  const cur = items[i];
                  if (cur) items[i] = { ...cur, degree: e.target.value };
                  set("education", { ...doc.education, items });
                }}
              />
              <Input
                placeholder="Year"
                value={ed.year}
                onChange={(e) => {
                  const items = [...doc.education.items];
                  const cur = items[i];
                  if (cur) items[i] = { ...cur, year: e.target.value };
                  set("education", { ...doc.education, items });
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              set("education", {
                ...doc.education,
                items: [...doc.education.items, { school: "", degree: "", year: "" }],
              })
            }
          >
            Add education
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Projects</CardTitle>
          <Switch
            checked={doc.projects.enabled}
            onCheckedChange={(v) => set("projects", { ...doc.projects, enabled: v })}
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {doc.projects.items.map((p, i) => (
            <div key={i} className="border-base-300 space-y-2 rounded-lg border p-4">
              <Input
                placeholder="Name"
                value={p.name}
                onChange={(e) => {
                  const items = [...doc.projects.items];
                  const cur = items[i];
                  if (cur) items[i] = { ...cur, name: e.target.value };
                  set("projects", { ...doc.projects, items });
                }}
              />
              <Input
                placeholder="URL"
                value={p.url}
                onChange={(e) => {
                  const items = [...doc.projects.items];
                  const cur = items[i];
                  if (cur) items[i] = { ...cur, url: e.target.value };
                  set("projects", { ...doc.projects, items });
                }}
              />
              <Textarea
                placeholder="Description"
                value={p.description}
                onChange={(e) => {
                  const items = [...doc.projects.items];
                  const cur = items[i];
                  if (cur) items[i] = { ...cur, description: e.target.value };
                  set("projects", { ...doc.projects, items });
                }}
              />
              <Input
                placeholder="Tech (comma-separated)"
                value={p.tech.join(", ")}
                onChange={(e) => {
                  const items = [...doc.projects.items];
                  const cur = items[i];
                  if (cur)
                    items[i] = {
                      ...cur,
                      tech: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    };
                  set("projects", { ...doc.projects, items });
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              set("projects", {
                ...doc.projects,
                items: [...doc.projects.items, { name: "", url: "", description: "", tech: [] }],
              })
            }
          >
            Add project
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Skills</CardTitle>
          <Switch
            checked={doc.skills.enabled}
            onCheckedChange={(v) => set("skills", { ...doc.skills, enabled: v })}
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {doc.skills.groups.map((g, gi) => (
            <div key={gi} className="space-y-2">
              <Input
                placeholder="Group name"
                value={g.name}
                onChange={(e) => {
                  const groups = [...doc.skills.groups];
                  const cur = groups[gi];
                  if (cur) groups[gi] = { ...cur, name: e.target.value };
                  set("skills", { ...doc.skills, groups });
                }}
              />
              <Textarea
                placeholder="Skills (one per line)"
                rows={3}
                value={g.items.join("\n")}
                onChange={(e) => {
                  const groups = [...doc.skills.groups];
                  const cur = groups[gi];
                  if (cur)
                    groups[gi] = {
                      ...cur,
                      items: e.target.value.split("\n").filter(Boolean),
                    };
                  set("skills", { ...doc.skills, groups });
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              set("skills", {
                ...doc.skills,
                groups: [...doc.skills.groups, { name: "", items: [] }],
              })
            }
          >
            Add skill group
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={() => onChange(createDefaultResume())}>
          Reset to sample
        </Button>
      </div>
    </div>
  );
}
