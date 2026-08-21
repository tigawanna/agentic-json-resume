import { describe, expect, it } from "vitest";
import type { AppDb } from "./collection";
import {
  appendResumeItemOrder,
  itemsInResumeOrder,
  junctionEntityIds,
  removeResumeItemOrder,
  reorderResumeItems,
} from "./resume-item-order";
import type { Resume } from "./schemas";

function resumeStub(overrides: Partial<Resume> = {}): Resume {
  return {
    id: "r1",
    userId: "u1",
    name: "Test",
    fullName: "Test User",
    headline: "",
    description: "",
    jobDescription: "",
    jobId: null,
    templateId: "classic",
    experienceOrder: [],
    educationOrder: [],
    projectOrder: [],
    talkOrder: [],
    searchableText: "",
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

function dbWithResume(resume: Resume) {
  return {
    collections: {
      resume: {
        update(_id: string, updater: (draft: Resume) => void) {
          updater(resume);
        },
      },
    },
  } as unknown as AppDb;
}

describe("itemsInResumeOrder", () => {
  const items = [
    { resumeId: "r1", sortOrder: 1, experienceId: "b" },
    { resumeId: "r1", sortOrder: 0, experienceId: "a" },
    { resumeId: "r2", sortOrder: 0, experienceId: "other" },
  ];

  it("falls back to junction sortOrder when no order is stored", () => {
    expect(itemsInResumeOrder("r1", items, undefined, (item) => item.experienceId)).toEqual([
      items[1],
      items[0],
    ]);
  });

  it("applies stored order and appends leftover items", () => {
    expect(itemsInResumeOrder("r1", items, ["b", "missing"], (item) => item.experienceId)).toEqual([
      items[0],
      items[1],
    ]);
  });
});

describe("junctionEntityIds", () => {
  it("returns entity ids for a resume sorted by sortOrder", () => {
    const items = [
      { id: "j2", resumeId: "r1", sortOrder: 2, experienceId: "b" },
      { id: "j1", resumeId: "r1", sortOrder: 1, experienceId: "a" },
    ];
    expect(junctionEntityIds(items, "r1", "experienceId")).toEqual(["a", "b"]);
  });
});

describe("appendResumeItemOrder / removeResumeItemOrder", () => {
  it("appends a new entity and can remove it", () => {
    const resume = resumeStub({ experienceOrder: ["a"] });
    const db = dbWithResume(resume);
    appendResumeItemOrder(db, "r1", "experienceOrder", "b", ["a"]);
    expect(resume.experienceOrder).toEqual(["a", "b"]);
    removeResumeItemOrder(db, "r1", "experienceOrder", "a");
    expect(resume.experienceOrder).toEqual(["b"]);
  });
});

describe("reorderResumeItems", () => {
  it("swaps two entity ids and writes junction sortOrder", () => {
    const resume = resumeStub({ experienceOrder: ["a", "b"] });
    const db = dbWithResume(resume);
    const items = [
      { id: "j1", resumeId: "r1", sortOrder: 0, experienceId: "a" },
      { id: "j2", resumeId: "r1", sortOrder: 1, experienceId: "b" },
    ];
    const updates: Array<{ id: string; sortOrder: number }> = [];

    reorderResumeItems(db, "r1", "experienceOrder", "a", "b", items, "experienceId", {
      update(id, updater) {
        const draft = { sortOrder: 0, updatedAt: 0 };
        updater(draft);
        updates.push({ id, sortOrder: draft.sortOrder });
      },
    });

    expect(resume.experienceOrder).toEqual(["b", "a"]);
    expect(updates).toEqual([
      { id: "j2", sortOrder: 0 },
      { id: "j1", sortOrder: 1 },
    ]);
  });
});
