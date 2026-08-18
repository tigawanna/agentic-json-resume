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

import type { ResumeContact } from "@/data-access-layer/event-sourced/schemas";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { useAppForm } from "@/lib/tanstack/form";
import { unwrapUnknownError } from "@/utils/errors";
import { formOptions } from "@tanstack/react-form";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { joinSearchable, touchUpdatedAt } from "../../-utils/row-helpers";

const editOpts = formOptions({
  defaultValues: { type: "", label: "", value: "" },
});

interface ContactEditFormProps {
  item: ResumeContact;
  onSuccess?: () => void;
}

export function ContactEditForm({ item, onSuccess }: ContactEditFormProps) {
  const db = useEventSourcedDb();
  const [pending, setPending] = useState(false);
  const containerRef = useRef<HTMLFormElement>(null);

  const form = useAppForm({
    ...editOpts,
    defaultValues: {
      type: item.type ?? "",
      label: item.label ?? "",
      value: item.value ?? "",
    },
    onSubmit: async ({ value }) => {
      setPending(true);
      try {
        db.collections.resumeContact.update(item.id, (draft) => {
          draft.type = value.type;
          draft.label = value.label;
          draft.value = value.value;
          draft.searchableText = joinSearchable(value.type, value.value, value.label);
          draft.updatedAt = touchUpdatedAt();
        });
        toast.success("Contact saved");
        onSuccess?.();
      } catch (err: unknown) {
        toast.error("Failed to save contact", {
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
      <div className="grid gap-3 sm:grid-cols-2">
        <form.AppField
          name="type"
          validators={{
            onChange: ({ value }) => (!value?.trim() ? "Type is required" : undefined),
          }}
        >
          {(field) => (
            <div>
              <Label className="text-xs">Type</Label>
              <Combobox
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value ?? "")}
              >
                <ComboboxInput
                  placeholder="Select or type…"
                  showTrigger
                  showClear
                  disabled={false}
                />
                <ComboboxContent container={containerRef}>
                  <ComboboxList>
                    {["email", "phone", "location", "address", "website"].map((option) => (
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
        <form.AppField name="label">
          {(field) => (
            <div>
              <Label className="text-xs">Label</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </form.AppField>
      </div>
      <form.AppField
        name="value"
        validators={{
          onChange: ({ value }) => (!value?.trim() ? "Value is required" : undefined),
        }}
      >
        {(field) => (
          <div>
            <Label className="text-xs">Value</Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="mt-1"
            />
          </div>
        )}
      </form.AppField>
      <form.Subscribe selector={(s) => s.values}>
        {(values) => {
          const hasRequired = Boolean(values.type.trim()) && Boolean(values.value.trim());
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
