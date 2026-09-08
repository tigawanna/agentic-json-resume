import { RefreshCwOff } from "lucide-react";

interface AuthBrandPanelProps {
  kicker: string;
  caption: string;
}

export function AuthBrandPanel({ kicker, caption }: AuthBrandPanelProps) {
  return (
    <aside className="hidden w-[30%] flex-col items-center justify-center gap-7 md:flex">
      <img src="/logo.svg" alt="" className="w-full object-contain" />
      <p className="flex max-w-[16rem] items-start gap-2.5">
        <RefreshCwOff className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
        <span className="min-w-0">
          <span className="text-muted-foreground mb-1 block text-[0.65rem] font-medium tracking-[0.2em] uppercase">
            {kicker}
          </span>
          <span className="text-foreground/85 text-sm leading-snug text-pretty">{caption}</span>
        </span>
      </p>
    </aside>
  );
}

export function AuthLocalKicker({ label }: { label: string }) {
  return (
    <p className="text-muted-foreground flex items-center gap-1.5 text-[0.65rem] font-medium tracking-[0.2em] uppercase md:hidden">
      <RefreshCwOff className="text-primary size-3 shrink-0" aria-hidden />
      {label}
    </p>
  );
}
