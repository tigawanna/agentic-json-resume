import type { ResumeDocumentV1 } from "./resume-schema";

export function buildTailorPrompt(baseResume: ResumeDocumentV1, jobDescription: string): string {
  const resumeJson = JSON.stringify(baseResume, null, 2);

  return `I need you to tailor my resume for a specific job posting. Below is my current resume in JSON format and the job description I'm targeting.

## Instructions

1. Read my current resume JSON and the job description carefully.
2. Tailor the resume content to match the job requirements — adjust bullets, reorder sections, emphasize relevant skills, and tweak the summary.
3. Do NOT change the JSON structure. The output must be valid JSON that matches the exact same schema as the input.
4. Do NOT add new fields or remove existing ones.
5. Keep \`version\`, \`meta\`, and \`sectionOrder\` unchanged unless reordering sections makes sense for the role.
6. Return ONLY the JSON — no markdown fences, no explanation, just raw JSON.

## My Current Resume (JSON)

${resumeJson}

## Job Description

${jobDescription}

## Output

Return the tailored resume as raw JSON (same schema as above):`;
}
