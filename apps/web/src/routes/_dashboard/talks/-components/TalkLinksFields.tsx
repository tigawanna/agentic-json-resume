import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import type { TalkLink } from "../-utils/talk-links";

interface TalkLinksFieldsProps {
  links: TalkLink[];
  onChange: (links: TalkLink[]) => void;
  disabled?: boolean;
}

export function TalkLinksFields({ links, onChange, disabled }: TalkLinksFieldsProps) {
  function addLink() {
    onChange([...links, { label: "", url: "" }]);
  }

  function removeLink(index: number) {
    onChange(links.filter((_, i) => i !== index));
  }

  function updateLink(index: number, key: keyof TalkLink, value: string) {
    onChange(links.map((link, i) => (i === index ? { ...link, [key]: value } : link)));
  }

  return (
    <div className="flex flex-col gap-2" data-test="talk-links-fields">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">Links</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={addLink}
          disabled={disabled}
        >
          <Plus className="mr-1 size-3" />
          Add
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">
        Video, slides, GitHub, or anything else people should open.
      </p>
      {links.length === 0 ? (
        <p className="text-muted-foreground rounded-md border border-dashed px-3 py-2 text-xs">
          No links yet. Add a URL when you have a recording or deck.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {links.map((link, index) => (
            <div
              key={index}
              className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)_auto] items-start gap-2"
            >
              <Input
                value={link.label}
                onChange={(e) => updateLink(index, "label", e.target.value)}
                placeholder="Slides"
                className="h-8 text-sm"
                disabled={disabled}
                aria-label={`Link ${index + 1} label`}
              />
              <Input
                value={link.url}
                onChange={(e) => updateLink(index, "url", e.target.value)}
                placeholder="https://…"
                className="h-8 text-sm"
                inputMode="url"
                disabled={disabled}
                aria-label={`Link ${index + 1} URL`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={() => removeLink(index)}
                disabled={disabled}
                aria-label={`Remove link ${index + 1}`}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
