import "@tanstack/react-start/server-only";

import { chat, type AnyTextAdapter, type ModelMessage, type StreamChunk } from "@tanstack/ai";
import { createOpenRouterText } from "@tanstack/ai-openrouter";
import { serverEnv } from "@/lib/server-env";
import {
  cloneCurrentResumeToolDefinition,
  createResumeFromDocumentToolDefinition,
  getCurrentResumeDocumentToolDefinition,
  navigateToResumeToolDefinition,
  refreshResumePreviewToolDefinition,
  searchCurrentResumeBlocksToolDefinition,
  updateCurrentResumeDocumentToolDefinition,
} from "@/features/agentic-tools/resume-chat-tool-definitions";

const eventSourcedResumeAiToolDefinitions = [
  getCurrentResumeDocumentToolDefinition,
  searchCurrentResumeBlocksToolDefinition,
  cloneCurrentResumeToolDefinition,
  createResumeFromDocumentToolDefinition,
  updateCurrentResumeDocumentToolDefinition,
  refreshResumePreviewToolDefinition,
  navigateToResumeToolDefinition,
] as const;

function buildSystemPrompt(resumeId: string, jobDescription: string | undefined): string {
  return [
    "You are an expert resume tailoring assistant for a local-first JSON resume editor.",
    `The current resume id is "${resumeId}".`,
    jobDescription?.trim()
      ? `The currently saved job description is:\n${jobDescription.trim()}`
      : "There is no saved job description yet. Ask for one or work from the user's latest message.",
    "Rules:",
    "- Ground your advice in the resume data you load with tools. Those tools run in the browser against the user's local database.",
    "- Never invent employers, titles, projects, dates, or metrics.",
    "- Use search_current_resume_blocks when you need relevant bullets or skills for a target role.",
    "- Prefer clone_current_resume before creating a tailored variant so the original resume remains intact.",
    "- You may create a new draft with clone_current_resume or create_resume_from_document when the user asks you to save a tailored draft.",
    "- After a successful clone or create, briefly tell the user the draft is ready. You may call navigate_to_resume so they can open it.",
    "- Use update_current_resume_document to apply targeted edits directly to the current resume. Always call get_current_resume_document first, then pass the complete updated document.",
    "- After writes, call refresh_resume_preview so the live editor can catch up.",
    "- Keep responses practical and specific.",
    "- If you provide JSON, it must be valid ResumeDocumentV1 JSON with no markdown fences.",
    "- DO NOT use emdashes prfer commas and similar punctuation.",
  ].join("\n\n");
}

function buildTextAdapter(apiKey: string | undefined, model: string | undefined): AnyTextAdapter {
  if (serverEnv.LMSTUDIO_BASE_URL) {
    const lmModel = serverEnv.LMSTUDIO_MODEL ?? "gemma-3-12b-it";
    return createOpenRouterText(lmModel as never, "lm-studio", {
      serverURL: serverEnv.LMSTUDIO_BASE_URL,
    }) as unknown as AnyTextAdapter;
  }

  if (!apiKey || !model) {
    throw new Error("apiKey and model are required when not using a local LM Studio server");
  }

  return createOpenRouterText(model as never, apiKey, {
    httpReferer: serverEnv.FRONTEND_URL,
  }) as unknown as AnyTextAdapter;
}

export async function streamEventSourcedResumeAgentChat(input: {
  resumeId: string;
  messages: ModelMessage[];
  jobDescription?: string;
  apiKey?: string;
  model?: string;
}): Promise<AsyncIterable<StreamChunk>> {
  return chat({
    adapter: buildTextAdapter(input.apiKey, input.model),
    messages: input.messages as never,
    systemPrompts: [buildSystemPrompt(input.resumeId, input.jobDescription)],
    tools: [...eventSourcedResumeAiToolDefinitions],
  });
}
