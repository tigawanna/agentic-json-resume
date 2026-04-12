# Agentic JSON Resume

Monorepo for a résumé product: **JSON as source of truth**, **tailor with any LLM** using a job description, **paste JSON back**, get a **PDF** from React—without fighting Google Docs or raw prose dumps.

- **Stack:** pnpm workspaces, Turbo, Vite+, TanStack Start, React 19, Tailwind.
- **Package name:** `agentic-json-resume` (root `package.json`).
- **App branding:** `apps/site/src/utils/system.tsx` (`AppConfig`).

## Scripts

```bash
pnpm install
pnpm dev
```

Use **`vp`** from the repo root for lint/format/test per `CLAUDE.md` (e.g. `vp check`).

## Docs

- `VISION.md` — product problem, JSON+LLM loop, future “agentic” direction.
- `ARCHITECTURE.md` — how the repo is organized and where the builder will plug in.

## License

Add your license.
