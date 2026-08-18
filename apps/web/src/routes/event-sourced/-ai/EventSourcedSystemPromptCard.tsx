import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ScrollText } from "lucide-react";
import { useEffect, useState } from "react";
import { EVENT_SOURCED_SYSTEM_PROMPT_MAX_CHARS } from "./system-prompt";

interface EventSourcedSystemPromptCardProps {
  isCustom: boolean;
  systemPrompt: string;
  onReset: () => void;
  onSave: (value: string) => void;
}

export function EventSourcedSystemPromptCard({
  isCustom,
  systemPrompt,
  onReset,
  onSave,
}: EventSourcedSystemPromptCardProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(systemPrompt);
  const dirty = draft !== systemPrompt;

  useEffect(() => {
    setDraft(systemPrompt);
  }, [systemPrompt]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card
        className="overflow-hidden border-0 bg-[color-mix(in_oklch,var(--color-base-200)_92%,var(--color-base-content)_8%)] shadow-[0_18px_55px_color-mix(in_oklch,var(--color-base-content)_8%,transparent)] ring-1 ring-[color-mix(in_oklch,var(--color-base-content)_10%,transparent)]"
        data-test="event-sourced-system-prompt-card"
      >
        <CardHeader className="gap-0 p-0">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-start justify-between gap-3 px-6 py-5 text-left"
              data-test="event-sourced-system-prompt-toggle"
            >
              <div className="flex min-w-0 gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--color-primary)_14%,transparent)] text-primary">
                  <ScrollText className="size-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base">System prompt</CardTitle>
                  <CardDescription className="mt-1 max-w-3xl text-sm leading-6">
                    {open
                      ? "Instructions sent with every message. The current résumé id and saved job description are still appended automatically."
                      : isCustom
                        ? "Custom instructions are saved in this browser."
                        : "Using the default instructions."}
                  </CardDescription>
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-2 pt-1">
                <span className="rounded-full bg-[color-mix(in_oklch,var(--color-primary)_10%,transparent)] px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  {dirty ? "Unsaved" : isCustom ? "Custom" : "Default"}
                </span>
                <ChevronDown
                  className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                />
              </span>
            </button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="flex flex-col gap-3 pt-0">
            <Textarea
              value={draft}
              onChange={(event) =>
                setDraft(event.target.value.slice(0, EVENT_SOURCED_SYSTEM_PROMPT_MAX_CHARS))
              }
              rows={10}
              className="min-h-48 font-mono text-xs leading-5"
              data-test="event-sourced-system-prompt-input"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {draft.length.toLocaleString()} /{" "}
                {EVENT_SOURCED_SYSTEM_PROMPT_MAX_CHARS.toLocaleString()} characters
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!isCustom && !dirty}
                  onClick={onReset}
                  data-test="event-sourced-system-prompt-reset"
                >
                  Reset default
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!dirty}
                  onClick={() => onSave(draft)}
                  data-test="event-sourced-system-prompt-save"
                >
                  Save prompt
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
