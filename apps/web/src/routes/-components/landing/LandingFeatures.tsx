import { Copy, FileDown, FileJson } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppConfig } from "@/utils/system";

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: FileJson,
    title: "One JSON schema",
    description:
      "Your résumé lives as structured data. The UI and PDF are views on that data—so edits stay consistent.",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    icon: Copy,
    title: "Use any LLM",
    description:
      "Copy your JSON, add the job description in ChatGPT or another assistant, and paste the updated JSON back. No lock-in to one provider.",
    iconColor: "text-earth-green-400",
    iconBg: "bg-earth-green-400/10",
  },
  {
    icon: FileDown,
    title: "PDF from components",
    description:
      "React turns the same JSON into on-screen layout and a print-ready PDF—less manual reformatting than fixing a doc.",
    iconColor: "text-terracotta",
    iconBg: "bg-terracotta/10",
  },
];

function FeatureCard({ feature, index }: { feature: FeatureItem; index: number }) {
  const Icon = feature.icon;

  return (
    <div
      className="animate-fade-in group relative rounded-2xl border border-border bg-base-200 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div
        className={`mb-6 inline-flex size-14 items-center justify-center rounded-xl ${feature.iconBg} ${feature.iconColor} transition-transform group-hover:scale-110`}
      >
        <Icon className="size-7" />
      </div>
      <h3 className="mb-3 font-serif text-2xl text-base-content">{feature.title}</h3>
      <p className="leading-relaxed text-base-content/60">{feature.description}</p>
    </div>
  );
}

export function LandingFeatures() {
  return (
    <section id="features" className="scroll-mt-20 bg-base-100 py-24">
      <div className="container">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-4xl text-base-content md:text-5xl">
            How <span className="italic text-primary">{AppConfig.name}</span> works
          </h2>
          <p className="mx-auto max-w-lg text-lg text-base-content/60">
            Three steps: store JSON, tailor it with an assistant, export PDF from the same source
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
