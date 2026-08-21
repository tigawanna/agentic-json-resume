import { Link } from "@tanstack/react-router";

export function LandingCTA() {
  return (
    <section data-test="landing-cta" className="mx-auto max-w-360 border-x border-border/50">
      <div className="border-t border-border/50 px-8 py-24 md:px-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-serif text-4xl font-medium tracking-tight text-base-content md:text-5xl">
            Start from <span className="italic text-primary">your</span> JSON
          </h2>
          <p className="mx-auto mb-10 max-w-md text-muted-foreground">
            Open the dashboard in this browser with no account. Sign in later when you want to sync
            your work to the server.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/dashboard"
              className="bg-primary px-8 py-3 font-mono text-sm font-medium text-primary-content transition-opacity hover:opacity-90"
            >
              Open the editor →
            </Link>
            <Link
              to="/auth"
              search={{ returnTo: "/dashboard" }}
              className="border border-border px-8 py-3 font-mono text-sm text-base-content transition-colors hover:bg-neutral"
            >
              Sign in to sync
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
