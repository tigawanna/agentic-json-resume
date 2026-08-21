import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ModelPicker } from "@/features/agentic-tools/ModelPicker";
import type { AiSettings } from "@/types/ai-settings";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { isLocalMode } from "@/routes/_dashboard/resumes/$resumeId/-components/ResumeAiTab/resume-ai-types";
import {
  EVENT_SOURCED_SYSTEM_PROMPT_MAX_CHARS,
  DEFAULT_EVENT_SOURCED_SYSTEM_PROMPT,
} from "../-utils/system-prompt";

const DEFAULT_MODEL = "deepseek/deepseek-chat-v3-0324";

interface EventSourcedAiSettingsModalProps {
  open: boolean;
  settings: AiSettings | null;
  systemPrompt: string;
  isCustomSystemPrompt: boolean;
  onOpenChange: (open: boolean) => void;
  onClearSettings: () => void;
  onSaveSettings: (settings: AiSettings) => void;
  onSaveSystemPrompt: (value: string) => void;
  onResetSystemPrompt: () => void;
}

export function EventSourcedAiSettingsModal({
  open,
  settings,
  systemPrompt,
  isCustomSystemPrompt,
  onOpenChange,
  onClearSettings,
  onSaveSettings,
  onSaveSystemPrompt,
  onResetSystemPrompt,
}: EventSourcedAiSettingsModalProps) {
  const [apiKey, setApiKey] = useState(settings?.apiKey ?? "");
  const [model, setModel] = useState(settings?.model ?? DEFAULT_MODEL);
  const [promptDraft, setPromptDraft] = useState(systemPrompt);
  const [showKey, setShowKey] = useState(false);
  const promptDirty = promptDraft !== systemPrompt;

  useEffect(() => {
    if (!open) return;
    setApiKey(settings?.apiKey ?? "");
    setModel(settings?.model ?? DEFAULT_MODEL);
    setPromptDraft(systemPrompt);
    setShowKey(false);
  }, [open, settings, systemPrompt]);

  function handleSave() {
    if (!isLocalMode) {
      if (!apiKey.trim() || !model) return;
      onSaveSettings({ apiKey: apiKey.trim(), model, storageType: "local" });
    }
    if (promptDirty) onSaveSystemPrompt(promptDraft);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-border/60 border-b px-6 py-4">
          <DialogTitle>AI settings</DialogTitle>
          <DialogDescription>
            Provider, model, and system prompt. Stored in the local database and synced when sync is
            on.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
          {isLocalMode ? (
            <p className="text-muted-foreground text-sm">Using LM Studio. No API key required.</p>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="event-sourced-api-key">OpenRouter API key</Label>
                <div className="relative">
                  <Input
                    id="event-sourced-api-key"
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    placeholder="sk-or-v1-..."
                    autoComplete="off"
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((value) => !value)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md"
                    aria-label={showKey ? "Hide key" : "Show key"}
                  >
                    {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Model</Label>
                <ModelPicker value={model} onChange={setModel} />
              </div>
            </>
          )}

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="event-sourced-system-prompt">System prompt</Label>
              <span className="text-muted-foreground text-xs">
                {isCustomSystemPrompt || promptDirty ? "Custom" : "Default"}
              </span>
            </div>
            <Textarea
              id="event-sourced-system-prompt"
              value={promptDraft}
              onChange={(event) =>
                setPromptDraft(event.target.value.slice(0, EVENT_SOURCED_SYSTEM_PROMPT_MAX_CHARS))
              }
              rows={10}
              className="min-h-40 font-mono text-xs leading-5"
              data-test="event-sourced-system-prompt-input"
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">
                {promptDraft.length.toLocaleString()} /{" "}
                {EVENT_SOURCED_SYSTEM_PROMPT_MAX_CHARS.toLocaleString()}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!isCustomSystemPrompt && !promptDirty}
                onClick={() => {
                  onResetSystemPrompt();
                  setPromptDraft(DEFAULT_EVENT_SOURCED_SYSTEM_PROMPT);
                }}
                data-test="event-sourced-system-prompt-reset"
              >
                Reset default
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="border-border/60 border-t px-6 py-4">
          {settings && !isLocalMode ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClearSettings}>
              Clear key
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            className="gap-2"
            disabled={!isLocalMode && (!apiKey.trim() || !model)}
            onClick={handleSave}
            data-test="event-sourced-ai-settings-save"
          >
            <KeyRound className="size-3.5" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
