import { SiteIcon } from "@/components/icon/SiteIcon";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function RouterNotFoundComponent() {
  return (
    <div
      data-test="router-not-found"
      className="bg-base-100 relative h-full min-h-0 w-full flex-1 overflow-y-auto"
    >
      <div className="relative flex min-h-full flex-col">
        <div className="pointer-events-none absolute inset-0 opacity-40 motion-reduce:hidden">
          <BackgroundRippleEffect rows={8} cols={12} cellSize={56} />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-base-100)_72%)]"
        />

        <div className="relative z-10 grid min-h-full w-full flex-1 grid-cols-1 md:grid-cols-2">
          <div className="flex items-center justify-center px-6 py-12 md:px-10">
            <SiteIcon
              size={640}
              className="h-auto w-[min(88%,22rem)] md:w-[min(78%,32rem)]"
              aria-hidden
            />
          </div>

          <div className="flex flex-col items-center justify-center px-6 py-12 text-center md:items-start md:px-12 md:text-left">
            <p className="font-serif text-[clamp(4.5rem,12vw,7.5rem)] leading-none tracking-[-0.04em] text-base-content">
              404
            </p>
            <h1 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.03em] text-balance md:text-4xl">
              This path isn't on the resume
            </h1>
            <p className="text-base-content/70 mt-4 max-w-[42ch] text-base leading-7 text-pretty">
              Nothing maps to this URL. The sections you already have are still in the sidebar —
              pick one, or go home.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link
                to="/"
                data-test="router-not-found-home"
                className="btn btn-primary btn-sm rounded-full px-6"
              >
                Back home
              </Link>
              <button
                type="button"
                data-test="router-not-found-back"
                onClick={() => window.history.back()}
                className="btn btn-ghost btn-sm rounded-full px-6"
              >
                <ArrowLeft className="size-3.5" />
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
