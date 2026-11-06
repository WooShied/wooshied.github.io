/**
 * Loader for the live threat-feed summary published by github.com/WooShied/threat-feed.
 *
 * The data comes from another repo, so it is treated as untrusted: every field is
 * checked and trimmed, and links are rebuilt from known patterns instead of trusted
 * as given. React escapes all text, so nothing here is ever rendered as HTML.
 */

const REPO = "https://github.com/WooShied/threat-feed";
export const FEED_URL: string =
  import.meta.env.VITE_FEED_URL || "https://raw.githubusercontent.com/WooShied/threat-feed/main/site/latest.json";
export const FEED_REPO = REPO;

export interface FeedVuln {
  cve: string;
  vendor: string;
  product: string;
  name: string;
  added: string;
  due: string;
  ransomware: boolean;
  epss: number | null;
  delta?: number;
}

export interface Feed {
  date: string;
  generated: Date;
  total: number;
  ransomware: number;
  epssOk: boolean;
  isNew: boolean;
  /** New entries if there are any today, otherwise the most recent additions. */
  latest: FeedVuln[];
  movers: FeedVuln[];
  top: FeedVuln[];
  due: FeedVuln[];
  history: { date: string; count: number }[];
  notes: { date: string; text: string }[];
  digestUrl: string;
}

const CVE_RE = /^CVE-\d{4}-\d{4,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const str = (v: unknown, max = 160) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const date = (v: unknown) => (typeof v === "string" && DATE_RE.test(v) ? v : "");
const list = (v: unknown) => (Array.isArray(v) ? v : []);

function vuln(v: unknown): FeedVuln | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const cve = str(o.cve, 24);
  if (!CVE_RE.test(cve)) return null;
  const epss = num(o.epss);
  const delta = num(o.delta);
  return {
    cve,
    vendor: str(o.vendor, 60),
    product: str(o.product, 80),
    name: str(o.name),
    added: date(o.added),
    due: date(o.due),
    ransomware: o.ransomware === true,
    epss: epss === null ? null : Math.min(1, Math.max(0, epss)),
    ...(delta === null ? {} : { delta: Math.max(-1, Math.min(1, delta)) }),
  };
}

const vulns = (v: unknown, max: number) =>
  list(v)
    .map(vuln)
    .filter((x): x is FeedVuln => x !== null)
    .slice(0, max);

export function parseFeed(raw: unknown): Feed {
  if (!raw || typeof raw !== "object") throw new Error("bad payload");
  const o = raw as Record<string, unknown>;
  if (o.schema !== 1) throw new Error("unknown schema");
  const day = date(o.date);
  const generated = new Date(str(o.generated, 40));
  if (!day || Number.isNaN(generated.getTime())) throw new Error("bad date");

  const fresh = vulns(o.new, 8);
  const digest = str(o.digestUrl, 200);
  return {
    date: day,
    generated,
    total: Math.max(0, num(o.total) ?? 0),
    ransomware: Math.max(0, num(o.ransomware) ?? 0),
    epssOk: o.epssOk === true,
    isNew: fresh.length > 0,
    latest: fresh.length ? fresh : vulns(o.recent, 5),
    movers: vulns(o.movers, 5),
    top: vulns(o.top, 5),
    due: vulns(o.due, 5),
    history: list(o.history)
      .map((h) => {
        const r = (h ?? {}) as Record<string, unknown>;
        return { date: date(r.date), count: Math.max(0, num(r.count) ?? 0) };
      })
      .filter((h) => h.date)
      .slice(-30),
    notes: list(o.notes)
      .map((n) => {
        const r = (n ?? {}) as Record<string, unknown>;
        return { date: date(r.date), text: str(r.text, 400) };
      })
      .filter((n) => n.date && n.text)
      .slice(0, 4),
    // Only ever link into the threat-feed repo.
    digestUrl: digest.startsWith(`${REPO}/`) ? digest : REPO,
  };
}

let pending: Promise<Feed> | null = null;

/** Fetch once per page load; the terminal and the section share the result. */
export function loadFeed(): Promise<Feed> {
  if (!pending) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10_000);
    pending = fetch(FEED_URL, { signal: ctrl.signal, credentials: "omit", referrerPolicy: "no-referrer" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(parseFeed)
      .finally(() => clearTimeout(timer))
      .catch((e) => {
        pending = null; // allow a retry later
        throw e;
      });
  }
  return pending;
}

export const nvdUrl = (cve: string) => `https://nvd.nist.gov/vuln/detail/${cve}`;

export function pct(x: number | null): string {
  if (x === null) return "n/a";
  return x >= 0.9995 ? ">99.9%" : `${(x * 100).toFixed(1)}%`;
}

/** "3 hours ago", "yesterday", "4 days ago". */
export function ago(d: Date, now = new Date()): string {
  const mins = Math.round((now.getTime() - d.getTime()) / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

export function shortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}
