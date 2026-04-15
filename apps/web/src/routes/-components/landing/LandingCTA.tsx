import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function LandingCTA() {
  const { pathname } = useLocation();

  return (
    <section id="cta" className="scroll-mt-20 bg-base-100 py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-12 text-center md:p-20">
          <div className="absolute top-0 right-0 size-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-content/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 size-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary-content/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="mb-4 font-serif text-4xl leading-tight text-primary-content md:text-5xl">
              Start from <span className="italic text-primary-content/80">your</span> JSON
            </h2>
            <p className="mx-auto mb-10 max-w-md text-lg text-primary-content/70">
              Sign in to open the dashboard, paste or upload your schema, and iterate toward PDF
              export. The builder UI is next on the roadmap—this is the home for the product story.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/auth" search={{ returnTo: pathname }}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="gap-2 rounded-full px-8 text-base shadow-lg"
                >
                  Sign in
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link to="/auth/signup" search={{ returnTo: "/dashboard" }}>
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full border border-primary-content/25 px-8 text-base text-primary-content hover:bg-primary-content/10 hover:text-primary-content"
                >
                  Create an account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
