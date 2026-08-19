import { Button } from "@/components/ui/button";
import { ChevronRight, GitFork, Pencil, Trash2 } from "lucide-react";

type RowActionButtonsProps = {
  onEdit: () => void;
  onDelete: () => void;
  onClone?: () => void;
  onNavigateToDetails?: () => void;
  editTestId?: string;
  deleteTestId?: string;
  detailsTestId?: string;
  cloneTestId?: string;
};

export function RowActionButtons({
  onEdit,
  onDelete,
  onClone,
  onNavigateToDetails,
  editTestId = "row-edit-btn",
  deleteTestId = "row-delete-btn",
  detailsTestId = "row-details-btn",
  cloneTestId = "row-clone-btn",
}: RowActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      {onNavigateToDetails ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={onNavigateToDetails}
          data-test={detailsTestId}
          aria-label="View details"
        >
          <ChevronRight className="size-3.5" />
        </Button>
      ) : null}
      {onClone ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={onClone}
          data-test={cloneTestId}
          aria-label="Clone"
        >
          <GitFork className="size-3.5" />
        </Button>
      ) : null}
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
