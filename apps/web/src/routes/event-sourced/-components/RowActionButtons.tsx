import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

type RowActionButtonsProps = {
  onEdit: () => void;
  onDelete: () => void;
  editTestId?: string;
  deleteTestId?: string;
};

export function RowActionButtons({
  onEdit,
  onDelete,
  editTestId = "row-edit-btn",
  deleteTestId = "row-delete-btn",
}: RowActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={onEdit}
        data-test={editTestId}
        aria-label="Edit"
      >
        <Pencil className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive size-8"
        onClick={onDelete}
        data-test={deleteTestId}
        aria-label="Delete"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
