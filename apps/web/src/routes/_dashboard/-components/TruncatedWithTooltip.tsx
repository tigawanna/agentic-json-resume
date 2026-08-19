import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function TruncatedWithTooltip({
  text,
  empty = "—",
}: {
  text: string | null | undefined;
  empty?: string;
}) {
  const value = (text ?? "").trim();
  if (!value) {
    return <span className="text-muted-foreground">{empty}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block w-full cursor-default truncate">{value}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-sm text-pretty">
        {value}
      </TooltipContent>
    </Tooltip>
  );
}
