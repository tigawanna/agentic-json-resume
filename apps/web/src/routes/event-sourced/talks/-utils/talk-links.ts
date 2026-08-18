export type TalkLink = { label: string; url: string };

export function parseTalkLinks(raw: string | null | undefined): TalkLink[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is TalkLink =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as Record<string, unknown>).label === "string" &&
        typeof (x as Record<string, unknown>).url === "string",
    );
  } catch {
    return [];
  }
}

export function normalizeTalkLinks(links: TalkLink[]): TalkLink[] {
  return links
    .map((link) => ({
      label: link.label.trim(),
      url: withHttps(link.url.trim()),
    }))
    .filter((link) => link.url.length > 0)
    .map((link) => ({
      label: link.label || fallbackLabel(link.url),
      url: link.url,
    }));
}

function withHttps(url: string): string {
  if (!url) return url;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
  return `https://${url}`;
}

export function serializeTalkLinks(links: TalkLink[]): string {
  return JSON.stringify(normalizeTalkLinks(links));
}

export function talkLinksSearchable(links: TalkLink[]): string {
  return normalizeTalkLinks(links)
    .flatMap((link) => [link.label, link.url])
    .join(" ");
}

function fallbackLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "") || "Link";
  } catch {
    return "Link";
  }
}
