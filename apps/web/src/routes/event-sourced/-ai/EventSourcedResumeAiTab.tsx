import { ResumeAiConversationCard } from "@/routes/_dashboard/resumes/$resumeId/-components/ResumeAiTab/ResumeAiConversationCard";
import { ResumeAiPromptsCard } from "@/routes/_dashboard/resumes/$resumeId/-components/ResumeAiTab/ResumeAiPromptsCard";
import { ResumeAiProviderSettings } from "@/routes/_dashboard/resumes/$resumeId/-components/ResumeAiTab/ResumeAiProviderSettings";
import { EventSourcedSystemPromptCard } from "./EventSourcedSystemPromptCard";
import { useEventSourcedResumeAiChat } from "./use-event-sourced-resume-ai";

export function EventSourcedResumeAiTab({
  resumeId,
  jobDescription,
}: {
  resumeId: string;
  jobDescription: string;
}) {
  const chat = useEventSourcedResumeAiChat(resumeId, jobDescription);

  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-4"
      data-test="event-sourced-resume-ai-tab"
    >
      <ResumeAiProviderSettings
        clearSettings={chat.clearSettings}
        open={chat.settingsOpen}
        onOpenChange={chat.setSettingsOpen}
        saveSettings={chat.saveSettings}
        settings={chat.settings}
      />

      <EventSourcedSystemPromptCard
        isCustom={chat.isCustomSystemPrompt}
        systemPrompt={chat.systemPrompt}
        onReset={chat.resetSystemPrompt}
        onSave={chat.saveSystemPrompt}
      />

      <ResumeAiPromptsCard
        clearDialogOpen={chat.clearDialogOpen}
        clearScope="both"
        hasJobDescription={!!jobDescription.trim()}
        hasMessages={chat.messages.length > 0}
        isBusy={chat.isLoading}
        isClearPending={false}
        isReady={chat.isReady}
        onClearBoth={chat.clearLocalConversation}
        onClearDialogOpenChange={chat.handleClearDialogOpenChange}
        onClearRemote={chat.clearLocalConversation}
        onSendStarter={(message) => void chat.sendStarter(message)}
        localOnlyClear
      />

      <ResumeAiConversationCard
        activeModelLabel={chat.activeModelLabel}
        composerRef={chat.composerRef}
        createdResumeTo="/event-sourced/resumes/$resumeId"
        endOfMessagesRef={chat.endOfMessagesRef}
        errorMessage={chat.chatErrorMessage}
        historyPending={false}
        input={chat.input}
        isBusy={chat.isLoading}
        isReady={chat.isReady}
        messages={chat.messages}
        onEditPastPrompt={chat.editPastPrompt}
        onInputChange={chat.setInput}
        onKeyDown={chat.handleComposerKeyDown}
        onOpenSettings={() => chat.setSettingsOpen(true)}
        onRegenerate={() => void chat.reload()}
        onResendPastPrompt={(message) => void chat.resendPastPrompt(message)}
        onStop={chat.stop}
        onSubmit={chat.handleSubmit}
        savePending={false}
        sessionChars={chat.sessionChars}
        sessionGenerating={chat.sessionGenerating}
        settings={chat.settings}
        status={chat.status}
      />
    </div>
  );
}
