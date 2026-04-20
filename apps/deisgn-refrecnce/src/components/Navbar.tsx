import { useEffect, useState } from "react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1440px] border-x border-border/50 flex h-12 items-center justify-between">
        <div className="flex items-center border-r border-border/50 px-6 h-full">
          <span className="font-mono text-xs font-bold uppercase tracking-widest">
            Struct<span className="text-accent-red">Doc</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 border-r border-border/50 px-6 h-full font-mono text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent-red animate-pulse" />
            <span>Compiler : Active</span>
          </div>
          <span>v2.4.0</span>
        </div>

        <div className="flex h-full">
          <button
            onClick={() => setDark(!dark)}
            className="border-l border-border/50 px-4 h-full font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {dark ? "[ Light ]" : "[ Dark ]"}
          </button>
          <button className="border-l border-border/50 px-4 h-full font-mono text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            [ Docs ]
          </button>
          <button className="bg-primary text-primary-foreground px-6 h-full font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
            Initialize →
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
