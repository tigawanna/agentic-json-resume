import { Link } from "@tanstack/react-router";

export default function LandingDashboardLink() {
  return (
    <Link
      to="/dashboard"
      className="flex h-full items-center bg-primary px-6 font-mono text-xs uppercase tracking-widest text-primary-content transition-opacity hover:opacity-90"
    >
      Dashboard →
    </Link>
  );
}
