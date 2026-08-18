import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

type LibraryEmptyProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  onClearSearch?: () => void;
  hasSearch?: boolean;
  dataTest?: string;
};

export function LibraryEmpty({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  onClearSearch,
  hasSearch,
  dataTest,
}: LibraryEmptyProps) {
  return (
    <Empty data-test={dataTest}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon className="text-muted-foreground size-12" />
        </EmptyMedia>
        <EmptyTitle>{hasSearch ? "No matches" : title}</EmptyTitle>
        <EmptyDescription>
          {hasSearch
            ? "Nothing matched your search. Try a different keyword or clear the filter."
            : description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        {hasSearch && onClearSearch ? (
          <Button variant="outline" size="sm" onClick={onClearSearch} data-test="clear-search-btn">
            Clear search
          </Button>
        ) : (
          <Button size="sm" onClick={onAction} data-test="empty-create-btn">
            <Plus className="mr-1 size-4" />
            {actionLabel}
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
