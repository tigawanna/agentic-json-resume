import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { ResumeLanguage } from "@/data-access-layer/event-sourced/schemas";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { useAppForm } from "@/lib/tanstack/form";
import { unwrapUnknownError } from "@/utils/errors";
import { formOptions } from "@tanstack/react-form";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { joinSearchable, touchUpdatedAt } from "../../-utils/row-helpers";

const editOpts = formOptions({
  defaultValues: { name: "", proficiency: "" },
});

interface LanguageEditFormProps {
  item: ResumeLanguage;
  onSuccess?: () => void;
}

export function LanguageEditForm({ item, onSuccess }: LanguageEditFormProps) {
  const db = useEventSourcedDb();
  const [pending, setPending] = useState(false);
  const containerRef = useRef<HTMLFormElement>(null);

  const form = useAppForm({
    ...editOpts,
    defaultValues: {
      name: item.name ?? "",
      proficiency: item.proficiency ?? "",
    },
    onSubmit: async ({ value }) => {
      setPending(true);
      try {
        db.collections.resumeLanguage.update(item.id, (draft) => {
          draft.name = value.name;
          draft.proficiency = value.proficiency;
          draft.searchableText = joinSearchable(value.name, value.proficiency);
          draft.updatedAt = touchUpdatedAt();
        });
        toast.success("Language saved");
        onSuccess?.();
      } catch (err: unknown) {
        toast.error("Failed to save language", {
          description: unwrapUnknownError(err).message,
        });
      } finally {
        setPending(false);
      }
    },
  });

  return (
    <form
      ref={containerRef}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-3"
    >
      <form.AppField
        name="name"
        validators={{
          onChange: ({ value }) => (!value?.trim() ? "Language is required" : undefined),
        }}
      >
        {(field) => (
          <div>
            <Label className="text-xs">Language</Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="mt-1"
            />
          </div>
        )}
      </form.AppField>
      <form.AppField name="proficiency">
        {(field) => (
          <div>
            <Label className="text-xs">Proficiency</Label>
            <Combobox
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value ?? "")}
            >
              <ComboboxInput placeholder="Select or type…" showTrigger showClear disabled={false} />
              <ComboboxContent container={containerRef}>
                <ComboboxList>
                  {["Native", "Fluent", "Professional", "Conversational", "Basic"].map((option) => (
                    <ComboboxItem key={option} value={option}>
                      {option}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        )}
      </form.AppField>
      <form.Subscribe selector={(s) => s.values}>
        {(values) => {
          const hasRequired = Boolean(values.name.trim());
          return (
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={pending}
              >
                Reset
              </Button>
              <Button type="submit" disabled={pending || !hasRequired || !form.state.isFormValid}>
                {pending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
