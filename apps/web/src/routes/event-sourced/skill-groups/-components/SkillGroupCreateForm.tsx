import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useViewer } from "@/data-access-layer/auth/viewer";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { useAppForm } from "@/lib/tanstack/form";
import { unwrapUnknownError } from "@/utils/errors";
import { formOptions } from "@tanstack/react-form";
import { X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { findExistingByExactTitle } from "../../-utils/find-existing";
import { joinSearchable, libraryRowBase, newId, nowMs } from "../../-utils/row-helpers";

const createOpts = formOptions({
  defaultValues: { name: "" },
});

interface SkillGroupCreateFormProps {
  onSuccess?: () => void;
}

export function SkillGroupCreateForm({ onSuccess }: SkillGroupCreateFormProps) {
  const db = useEventSourcedDb();
  const { viewer } = useViewer();
  const [pending, setPending] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const form = useAppForm({
    ...createOpts,
    onSubmit: async ({ value }) => {
      setPending(true);
      try {
        const existing = findExistingByExactTitle(
          db.collections.resumeSkillGroup,
          value.name,
          (row) => row.name,
        );
        if (existing) {
          toast.success("Skill group already in library");
          onSuccess?.();
          return;
        }
        const base = libraryRowBase(viewer.user?.id);
        const searchableText = joinSearchable(value.name, ...skills);
        db.collections.resumeSkillGroup.insert({
          ...base,
          name: value.name,
          searchableText,
        });

        skills.forEach((skillName, index) => {
          const ts = nowMs();
          db.collections.resumeSkill.insert({
            id: newId(),
            groupId: base.id,
            name: skillName,
            level: null,
            sortOrder: index,
            searchableText: skillName,
            embedding: null,
            embeddingModel: null,
            createdAt: ts,
            updatedAt: ts,
          });
        });

        toast.success("Skill group created");
        onSuccess?.();
      } catch (err: unknown) {
        toast.error("Failed to create skill group", {
          description: unwrapUnknownError(err).message,
        });
      } finally {
        setPending(false);
      }
    },
  });

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      const val = skillInput.trim().replace(/,$/g, "");
      if (val && !skills.includes(val)) setSkills((prev) => [...prev, val]);
      setSkillInput("");
    }
  }

  return (
    <form
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
          onChange: ({ value }) => (!value?.trim() ? "Group name is required" : undefined),
        }}
      >
        {(field) => (
          <div>
            <Label className="text-xs">Group Name</Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="mt-1"
            />
          </div>
        )}
      </form.AppField>
      <div>
        <Label className="text-xs">Skills</Label>
        <Input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={handleSkillKeyDown}
          placeholder="Type a skill and press Enter"
          className="mt-1"
        />
        {skills.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-muted inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => setSkills((prev) => prev.filter((s) => s !== skill))}
                  className="hover:text-destructive"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <form.Subscribe selector={(s) => s.values}>
        {(values) => (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setSkills([]);
                setSkillInput("");
              }}
              disabled={pending}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={pending || !values.name.trim() || !form.state.isFormValid}
            >
              {pending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        )}
      </form.Subscribe>
    </form>
  );
}

interface SkillGroupCreateFormDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SkillGroupCreateFormDialog({ open, setOpen }: SkillGroupCreateFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Skill Group</DialogTitle>
        </DialogHeader>
        <SkillGroupCreateForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
