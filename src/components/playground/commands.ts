import { profile } from "../../content/profile";
import { NAV } from "../navItems";
import { loadFeed, pct, shortDate, type FeedVuln } from "../../feed";

export interface Out {
  text: string;
  tone?: "dim" | "ok" | "err" | "accent" | "cmd";
}

export interface Ctx {
  goto: (id: string) => void;
  tab: (id: "triage" | "replay" | "terminal") => void;
  clear: () => void;
}

type Cmd = { help: string; run: (args: string[], ctx: Ctx) => Out[] | Promise<Out[]>; hidden?: boolean };

const say = (text: string, tone?: Out["tone"]): Out => ({ text, tone });

/** Unicode-safe Base64 using the browser's own encoder. */
const toB64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const fromB64 = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)));

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const sections = ["top", ...NAV.map((n) => n.id)];

const row = (v: FeedVuln) => say(`  ${v.cve.padEnd(16)} ${pct(v.epss).padStart(6)}  ${v.vendor} ${v.product}`);

export const commands: Record<string, Cmd> = {
  help: {
    help: "list commands",
    run: () => [
      say("Commands:", "dim"),
      ...Object.entries(commands)
        .filter(([, c]) => !c.hidden)
        .map(([k, c]) => say(`  ${k.padEnd(10)} ${c.help}`)),
      say("Tab completes · ↑/↓ history · Ctrl+L clears", "dim"),
    ],
  },
  whoami: {
    help: "who's this?",
    run: () => [say(profile.identity.name, "accent"), say(profile.hero.sub)],
  },
  about: { help: "short bio", run: () => profile.about.map((p) => say(p)) },
  now: {
    help: "current role",
    run: () => [say(`${profile.hero.now.title} · ${profile.hero.now.org}`, "accent"), say(profile.hero.now.detail)],
  },
  exp: {
    help: "experience",
    run: () =>
      profile.experience.flatMap((r) => [
        say(`${`${r.start} – ${r.end}`.padEnd(22)}${r.title}`),
        say(`${"".padEnd(22)}${r.employer}`, "dim"),
      ]),
  },
  layers: {
    help: "defense-in-depth layers",
    run: () => profile.layers.map((l, i) => say(`  L${i + 1}  ${l.name.padEnd(20)} ${l.tagline}`)),
  },
  skills: {
    help: "skills — skills identity",
    run: ([layer]) => {
      const ls = layer ? profile.layers.filter((l) => l.id.startsWith(layer.toLowerCase()) || l.name.toLowerCase().startsWith(layer.toLowerCase())) : profile.layers;
      if (!ls.length) return [say(`no such layer: ${layer} (try: ${profile.layers.map((l) => l.id).join(", ")})`, "err")];
      return ls.flatMap((l) => [
        say(l.name, "accent"),
        say(`  ${profile.skills.filter((s) => s.layer === l.id).map((s) => s.name).join(" · ")}`),
      ]);
    },
  },
  certs: {
    help: "certifications",
    run: () =>
      profile.certifications.map((c) =>
        say(`  ${c.status === "earned" ? "✓ earned  " : "… studying"}  ${c.name}${c.date ? ` (${c.date})` : ""}`, c.status === "earned" ? "ok" : undefined),
      ),
  },
  tools: {
    help: "full toolbox",
    run: () => profile.toolbox.flatMap((g) => [say(g.title, "accent"), say(`  ${g.items.join(" · ")}`)]),
  },
  ojt: {
    help: "learned on the job",
    run: () => profile.ojt.map((o) => say(`  • ${o.title}: ${o.detail}`)),
  },
  ls: { help: "list sections", run: () => sections.map((s, i) => say(`  ${String(i).padStart(2, "0")}  ${s}`)) },
  cd: {
    help: "go to a section — cd layers",
    run: ([t], ctx) => {
      if (!t) return [say("usage: cd <section>   (see ls)", "dim")];
      const id = t === "~" || t === "/" ? "top" : sections.find((s) => s.startsWith(t.toLowerCase()));
      if (!id) return [say(`cd: no such section: ${t}`, "err")];
      ctx.goto(id);
      return [say(`→ ~/${id === "top" ? "" : id}`, "ok")];
    },
  },
  triage: { help: "open the alert triage lab", run: (_, ctx) => (ctx.tab("triage"), [say("→ triage", "ok")]) },
  replay: { help: "open the attack replay", run: (_, ctx) => (ctx.tab("replay"), [say("→ attack replay", "ok")]) },
  intel: {
    help: "today's threat digest (live)",
    run: async (_, ctx) => {
      try {
        const f = await loadFeed();
        ctx.goto("intel");
        return [
          say(`threat-feed · ${shortDate(f.date)} · ${f.total.toLocaleString()} vulns under active attack`, "accent"),
          say(f.isNew ? "New in CISA KEV:" : "Most recent KEV additions:", "dim"),
          ...f.latest.slice(0, 3).map(row),
          say("Most likely to be exploited:", "dim"),
          ...f.top.slice(0, 3).map(row),
        ];
      } catch {
        return [say("intel: the live feed is unreachable right now", "err")];
      }
    },
  },
  hash: {
    help: "SHA-256 of text — hash hello",
    run: async (args) => {
      const s = args.join(" ");
      if (!s) return [say("usage: hash <text>", "dim")];
      return [say(await sha256(s), "accent"), say("computed locally with Web Crypto; nothing leaves your browser", "dim")];
    },
  },
  b64: {
    help: "Base64-encode text — b64 hello",
    run: (args) => (args.length ? [say(toB64(args.join(" ")), "accent")] : [say("usage: b64 <text>", "dim")]),
  },
  unb64: {
    help: "decode Base64 — unb64 aGVsbG8=",
    run: ([s]) => {
      if (!s) return [say("usage: unb64 <base64>", "dim")];
      try {
        return [say(fromB64(s), "accent")];
      } catch {
        return [say("unb64: that isn't valid Base64", "err")];
      }
    },
  },
  privacy: {
    help: "what this site collects",
    run: () => [
      say("Cookies ........... none", "ok"),
      say("Analytics ......... none", "ok"),
      say("Third-party calls . one: the Intel section loads a public JSON file from GitHub, no cookies sent", "ok"),
      say("Fonts ............. self-hosted", "ok"),
      say("Forms ............. none; the labs run entirely in your browser", "ok"),
    ],
  },
  contact: {
    help: "how to reach me",
    run: (_, ctx) => {
      ctx.goto("contact");
      return [say(`LinkedIn  ${profile.identity.links.linkedin.href}`), say(`GitHub    ${profile.identity.links.github.href}`)];
    },
  },
  date: { help: "local date and time", run: () => [say(new Date().toString())] },
  clear: { help: "clear the screen", run: (_, ctx) => (ctx.clear(), []) },
  sudo: { help: "", hidden: true, run: () => [say("Permission denied. Least privilege applies here too.", "err")] },
  rm: { help: "", hidden: true, run: () => [say("rm: nice try.", "err")] },
};

export const commandNames = Object.keys(commands).filter((k) => !commands[k].hidden);
