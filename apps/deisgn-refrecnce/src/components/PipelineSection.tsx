const steps = [
  {
    id: "01",
    label: "DATA LAYER",
    title: "Strict Schema Validation",
    description:
      "Rigid JSON enforcement ensures structural integrity before compilation. Malformed nodes or missing keys are rejected at initialization.",
    accentClass: "text-silver-dark",
    hoverClass: "group-hover:text-accent-red",
  },
  {
    id: "02",
    label: "LOGIC LAYER",
    title: "String Mutation via LLM",
    description:
      "Inject raw schemas into your preferred reasoning model. Request semantic tailoring against specific job requisites. Re-inject the parsed output.",
    accentClass: "text-accent-blue",
    hoverClass: "group-hover:text-accent-blue",
  },
  {
    id: "03",
    label: "PRESENTATION",
    title: "Deterministic Typesetting",
    description:
      "A proprietary layout algorithm calculates millimeter-precise margins, dynamic kerning, and baseline alignments for the final binary output.",
    accentClass: "text-silver-dark",
    hoverClass: "group-hover:text-foreground",
  },
];

const terminalLines = [
  { prefix: "~/career", text: " > structcv build ./source.json --target=staff-engineer.md" },
  { status: "ok", text: "Parsing source JSON..." },
  { status: "ok", text: "Connecting to inference node..." },
  { status: "info", text: "Pruning irrelevant nodes... Removed 4 objects" },
  { status: "ok", text: "Re-ranking highlights based on context..." },
  { status: "ok", text: "Rendering document template..." },
];

const PipelineSection = () => {
  return (
    <section className="mx-auto max-w-[1440px] border-x border-border/50 pb-24">
      <div className="px-8 md:px-16 pt-24 pb-12">
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight scroll-reveal">
          Deployment Pipeline
        </h2>
        <p className="text-muted-foreground max-w-[50ch] text-pretty mt-4 scroll-reveal scroll-reveal-delay-1">
          The build process for your professional narrative. No WYSIWYG editors.
          No misaligned text boxes. Pure structured data compiled to print-ready
          output.
        </p>
      </div>

      <div className="mx-8 md:mx-16 border border-border overflow-hidden">
        {/* 3 steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border scroll-reveal-stagger">
          {steps.map((step) => (
            <div
              key={step.id}
              className="scroll-reveal p-8 lg:p-12 hover:bg-accent/50 transition-colors group relative"
            >
              <div className="absolute top-4 right-4 text-xs text-silver-light group-hover:text-silver transition-colors font-mono">
                +
              </div>
              <div
                className={`text-4xl font-light text-silver mb-10 ${step.hoverClass} transition-colors tabular-nums font-mono`}
              >
                {step.id}.
              </div>
              <h3 className="text-xl md:text-2xl font-medium tracking-tight mb-4 text-balance">
                {step.title}
              </h3>
              <p className="text-muted-foreground font-light text-pretty text-sm md:text-base leading-relaxed max-w-[35ch]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Terminal output */}
        <div className="border-t border-border bg-card p-6 font-mono text-xs leading-loose text-muted-foreground scroll-reveal">
          {terminalLines.map((line, i) =>
            line.prefix ? (
              <div key={i}>
                <span className="text-silver-dark">{line.prefix}</span>
                {line.text}
              </div>
            ) : (
              <div key={i}>
                [INFO] {line.text}{" "}
                {line.status === "ok" && (
                  <span className="text-accent-blue">OK</span>
                )}
              </div>
            )
          )}
          <div className="text-foreground mt-4">
            {">"} Artifact generated:{" "}
            <span className="text-accent-blue underline underline-offset-4 decoration-accent-blue/30 cursor-pointer">
              out/resume_staff_eng.pdf
            </span>{" "}
            (142kb)
          </div>
        </div>
      </div>
    </section>
  );
};

export default PipelineSection;
