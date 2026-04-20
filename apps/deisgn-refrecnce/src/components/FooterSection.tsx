const FooterSection = () => {
  return (
    <footer className="mx-auto max-w-[1440px] border-x border-t border-border/50">
      <div className="px-8 md:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-muted-foreground">
        <span>
          Struct<span className="text-accent-red">Doc</span> — JSON in · LLM in
          the middle · PDF out
        </span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground transition-colors">
            Schema Spec
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Documentation
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
