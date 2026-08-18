import {
  cloneCurrentResumeToolDefinition,
  createResumeFromDocumentToolDefinition,
  getCurrentResumeDocumentToolDefinition,
  navigateToResumeToolDefinition,
  refreshResumePreviewToolDefinition,
  searchCurrentResumeBlocksToolDefinition,
  updateCurrentResumeDocumentToolDefinition,
} from "@/features/agentic-tools/resume-chat-tool-definitions";
import {
  cloneLocalResume,
  createLocalResumeFromDocument,
  getLocalResumeDocument,
  searchLocalResumeBlocks,
  updateLocalResumeDocument,
  type EventSourcedResumeAiContext,
} from "./local-resume-tools";

type ClientToolCtx = { context: EventSourcedResumeAiContext };

function asWorkbenchTab(tab: string): "edit" | "preview" | "json" {
  if (tab === "preview" || tab === "json") return tab;
  return "edit";
}

export const getCurrentResumeDocumentClientTool = getCurrentResumeDocumentToolDefinition.client(
  (_input, ctx: ClientToolCtx) => getLocalResumeDocument(ctx.context),
);

export const searchCurrentResumeBlocksClientTool = searchCurrentResumeBlocksToolDefinition.client(
  (input, ctx: ClientToolCtx) =>
    searchLocalResumeBlocks(ctx.context, {
      keyword: input.keyword,
      blockTypes: input.blockTypes,
      limitPerType: typeof input.limitPerType === "number" ? input.limitPerType : undefined,
    }),
);

export const cloneCurrentResumeClientTool = cloneCurrentResumeToolDefinition.client(
  (input, ctx: ClientToolCtx) => cloneLocalResume(ctx.context, input),
);

export const createResumeFromDocumentClientTool = createResumeFromDocumentToolDefinition.client(
  (input, ctx: ClientToolCtx) => createLocalResumeFromDocument(ctx.context, input),
);

export const updateCurrentResumeDocumentClientTool =
  updateCurrentResumeDocumentToolDefinition.client((input, ctx: ClientToolCtx) =>
    updateLocalResumeDocument(ctx.context, input.document),
  );

export const refreshResumePreviewClientTool = refreshResumePreviewToolDefinition.client(
  (_input, ctx: ClientToolCtx) => ({
    refreshed: true,
    resumeId: ctx.context.resumeId,
  }),
);

export const navigateToResumeClientTool = navigateToResumeToolDefinition.client(
  (input, ctx: ClientToolCtx) => {
    const tab = input.tab ?? "preview";
    ctx.context.navigateToResume(input.resumeId, asWorkbenchTab(tab));
    return {
      navigated: true,
      resumeId: input.resumeId,
      tab,
    };
  },
);

export const eventSourcedResumeAiClientTools = [
  getCurrentResumeDocumentClientTool,
  searchCurrentResumeBlocksClientTool,
  cloneCurrentResumeClientTool,
  createResumeFromDocumentClientTool,
  updateCurrentResumeDocumentClientTool,
  refreshResumePreviewClientTool,
  navigateToResumeClientTool,
];
