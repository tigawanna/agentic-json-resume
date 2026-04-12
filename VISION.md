# Agentic JSON Resume — product vision

## Problem

Tailoring a résumé to a job with an LLM usually produces a long block of text. Pasting that into Google Docs or a PDF workflow is slow, error-prone, and sometimes reads like undifferentiated model output. Editing HTML or divs by hand is tedious.

## Core idea

**Your résumé is JSON.** The app renders that JSON to React components and to PDF. You copy the JSON into ChatGPT (or any assistant), add the job description, get back revised JSON, paste it into the app, and download a consistent PDF—without maintaining a separate document.

## Why “agentic”

The near-term workflow is **manual but structured**: one prompt, one paste. Later, the same JSON-first model enables **agentic** flows: history of versions, matching public job descriptions to your profile, or proactive suggestions—without changing the core contract (structured data in, PDF out).

## Near-term priority

Ship the **builder**: edit JSON (or a form bound to JSON), preview, export PDF. Auth and dashboard shell already exist; the résumé schema UI and PDF pipeline are the next milestones.

## Non-goals (for now)

- Replacing LinkedIn or job boards
- Auto-applying to jobs without human review
- Requiring a specific LLM vendor
