import { describe, expect, it } from "vitest";
import { createDefaultResume, resumeDocumentV1Schema, toResumeDocumentV1 } from "./resume-schema";
import { getResumeDocumentToolOutputSchema } from "@/features/agentic-tools/resume-tool-schemas";

describe("toResumeDocumentV1", () => {
  it("coerces sqlite-style integer booleans and null strings into a valid document", () => {
    const base = createDefaultResume();
    const coerced = toResumeDocumentV1({
      ...base,
      header: { ...base.header, enabled: 1, fullName: null, email: undefined },
      summary: { enabled: 0, text: null },
      experience: {
        enabled: "true",
        items: [
          {
            company: "Acme",
            role: null,
            start: 2024,
            end: null,
            bullets: ["Shipped a thing", null],
          },
        ],
      },
    });

    expect(resumeDocumentV1Schema.safeParse(coerced).success).toBe(true);
    expect(coerced.header.enabled).toBe(true);
    expect(coerced.header.fullName).toBe("");
    expect(coerced.summary.enabled).toBe(false);
    expect(coerced.experience.items[0]?.role).toBe("");
    expect(coerced.experience.items[0]?.start).toBe("2024");

    const toolOutput = getResumeDocumentToolOutputSchema.safeParse({
      resume: {
        id: "01a019a6-e37f-74df-8224-01c7528efdf1",
        name: "User Resume",
        description: "",
        jobDescription: "",
        document: coerced,
        updatedAt: new Date().toISOString(),
      },
    });
    expect(toolOutput.success).toBe(true);
  });
});
