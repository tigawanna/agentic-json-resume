const HeroSection = () => {
  return (
    <section className="mx-auto max-w-[1440px] border-x border-border/50">
      {/* Hero copy */}
      <div className="border-b border-border/50 px-8 py-16 md:px-16 md:py-24 lg:px-24 lg:py-32">
        <div className="flex flex-col gap-8 max-w-4xl">
          <div className="flex items-center gap-3 font-mono scroll-reveal">
            <span className="text-accent-red text-xs uppercase tracking-widest border border-accent-red/30 bg-accent-red/5 px-2 py-1">
              Directive 01
            </span>
            <span className="text-muted-foreground text-xs">
              // Eliminate visual overhead
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.9] font-medium text-balance scroll-reveal scroll-reveal-delay-1">
            Deterministic resume compilation.
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-[50ch] leading-relaxed text-pretty font-light scroll-reveal scroll-reveal-delay-2">
            Define your career topology in pure JSON. Pipe through an external
            reasoning engine. Compile to a millimeter-perfect, print-ready PDF
            document.
          </p>

          <div className="flex flex-wrap gap-4 mt-4 scroll-reveal scroll-reveal-delay-3">
            <button className="bg-primary text-primary-foreground font-mono font-medium px-6 py-3 hover:opacity-90 transition-opacity shimmer relative overflow-hidden">
              Start Compiling →
            </button>
            <button className="border border-border text-foreground font-mono px-6 py-3 hover:bg-accent transition-colors">
              Read Docs
            </button>
          </div>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Code editor */}
        <div className="lg:col-span-7 border-r border-b lg:border-b-0 border-border/50 p-6 md:p-12 flex flex-col gap-4 scroll-reveal-left">
          <div className="flex justify-between items-end border-b border-border pb-3 font-mono">
            <div className="flex gap-4">
              <span className="text-xs font-semibold text-foreground">schema.json</span>
              <span className="text-xs text-muted-foreground">/src/data/</span>
            </div>
            <span className="text-xs text-accent-blue">Line 42, Col 18</span>
          </div>
          <div className="relative min-h-[360px]">
            <div className="absolute inset-0 bg-card border border-border shadow-[8px_8px_0_hsl(var(--border))] overflow-hidden">
              {/* Line numbers */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/50 border-r border-border flex flex-col items-end py-6 px-2 font-mono text-[11px] text-muted-foreground/60 select-none">
                {Array.from({ length: 16 }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <pre className="pl-16 p-6 h-full overflow-auto text-[13px] leading-relaxed font-mono text-foreground">
{`{
  "architect": {
    "name": "Elias Thorne",
    "directives": [
      "distributed systems",
      "consensus algorithms"
    ],
    "experience": [
      {
        "node": "Void Dynamics",
        "role": "Lead Infrastructure Engineer",
        "delta": "2021-PRESENT",
        "impact": "Engineered latency-bound..."
      }
    ]
  }
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="lg:col-span-5 border-b lg:border-b-0 border-border/50 p-6 md:p-12 flex flex-col items-center justify-center bg-muted/30 relative overflow-hidden scroll-reveal-right">
          <div className="absolute inset-0 pointer-events-none bg-blueprint-grid opacity-40" />

          <div className="w-full max-w-[300px] aspect-[1/1.4] bg-card shadow-2xl p-8 flex flex-col gap-6 relative z-10 border border-border">
            <div className="border-b-2 border-foreground pb-4">
              <div className="text-2xl font-medium tracking-tight uppercase font-display">
                Elias Thorne
              </div>
              <div className="text-[9px] text-muted-foreground mt-2 tracking-widest uppercase font-mono">
                elias.t@voiddynamics.net / SYS.ARCH.04
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest border-b border-border pb-1 mb-3">
                  Operations
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm font-medium">Void Dynamics</span>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    2021-CURR
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="bg-silver-light/50 h-1.5 w-full" />
                  <div className="bg-silver-light/50 h-1.5 w-5/6" />
                  <div className="bg-silver-light/50 h-1.5 w-11/12" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm font-medium">Kestrel Logistics</span>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    2018-2021
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="bg-silver-light/50 h-1.5 w-full" />
                  <div className="bg-silver-light/50 h-1.5 w-4/6" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-xs flex gap-6 px-4 py-2 border border-border bg-card/50 font-mono z-10">
            <span className="text-muted-foreground">output.pdf</span>
            <span className="text-foreground tabular-nums">14.2 KB</span>
            <span className="text-accent-red tabular-nums">184ms</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
