import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { AiSettings } from "@/types/ai-settings";
import { Bot, Search, Settings, WandSparkles } from "lucide-react";
import type { ResumeAiPromptAction } from "@/routes/_dashboard/resumes/$resumeId/-components/ResumeAiTab/resume-ai-types";
import { EventSourcedAiSettingsModal } from "./EventSourcedAiSettingsModal";

interface EventSourcedAiChromeProps {
  activeModelLabel: string | null;
  clearDialogOpen: boolean;
  hasJobDescription: boolean;
  hasMessages: boolean;
  isBusy: boolean;
  isCustomSystemPrompt: boolean;
  isReady: boolean;
  settings: AiSettings | null;
  settingsOpen: boolean;
  systemPrompt: string;
  onClearChat: () => void;
  onClearDialogOpenChange: (open: boolean) => void;
  onClearSettings: () => void;
  onOpenSettings: () => void;
  onResetSystemPrompt: () => void;
  onSaveSettings: (settings: AiSettings) => void;
  onSaveSystemPrompt: (value: string) => void;
  onSendStarter: ResumeAiPromptAction;
  onSettingsOpenChange: (open: boolean) => void;
}

export function EventSourcedAiChrome({
  activeModelLabel,
  clearDialogOpen,
  hasJobDescription,
  hasMessages,
  isBusy,
  isCustomSystemPrompt,
  isReady,
  settings,
  settingsOpen,
  systemPrompt,
  onClearChat,
  onClearDialogOpenChange,
  onClearSettings,
  onOpenSettings,
  onResetSystemPrompt,
  onSaveSettings,
  onSaveSystemPrompt,
  onSendStarter,
  onSettingsOpenChange,
}: EventSourcedAiChromeProps) {
  return (
    <>
      <div
        className="flex flex-wrap items-center justify-between gap-2"
        data-test="event-sourced-ai-chrome"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
            <span
              className={`size-1.5 rounded-full ${isReady ? "bg-success" : "bg-destructive"}`}
            />
            {isReady ? "Ready" : "Needs key"}
          </span>
          {activeModelLabel ? (
            <span className="text-muted-foreground truncate text-xs">{activeModelLabel}</span>
          ) : null}
          <span className="text-muted-foreground text-xs">
            · {isCustomSystemPrompt ? "Custom prompt" : "Default prompt"}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={onOpenSettings}
          data-test="event-sourced-ai-settings"
        >
          <Settings className="size-3.5" />
          Settings
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasJobDescription || isBusy || !isReady}
          onClick={() =>
            onSendStarter(
              "Use the saved job description and tell me how well this resume matches it, including the biggest gaps.",
            )
          }
          data-test="resume-ai-starter-match"
        >
          <Search className="size-3.5" />
          Job fit
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBusy || !isReady}
          onClick={() =>
            onSendStarter(
              "Load the current resume and draft a sharper professional summary targeted at senior full-stack roles.",
            )
          }
          data-test="resume-ai-starter-summary"
        >
          <Bot className="size-3.5" />
          Summary
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBusy || !isReady}
          onClick={() =>
            onSendStarter(
              "Load the current resume, search for the strongest relevant blocks, and propose a tailored draft plan before writing any JSON.",
            )
          }
          data-test="resume-ai-starter-draft"
        >
          <WandSparkles className="size-3.5" />
          Tailored draft
        </Button>
        <AlertDialog open={clearDialogOpen} onOpenChange={onClearDialogOpenChange}>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isBusy || !hasMessages}
              className="text-muted-foreground ml-auto"
              data-test="resume-ai-clear"
            >
              Clear chat
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the conversation stored in the local database for this résumé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel size="sm" variant="outline">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction variant="destructive" size="sm" onClick={onClearChat}>
                Clear this chat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <EventSourcedAiSettingsModal
        open={settingsOpen}
        settings={settings}
        systemPrompt={systemPrompt}
        isCustomSystemPrompt={isCustomSystemPrompt}
        onOpenChange={onSettingsOpenChange}
        onClearSettings={onClearSettings}
        onSaveSettings={onSaveSettings}
        onSaveSystemPrompt={onSaveSystemPrompt}
        onResetSystemPrompt={onResetSystemPrompt}
      />
    </>
  );
}
