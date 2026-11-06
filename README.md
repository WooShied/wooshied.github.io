# Clearance: Aadil Rashid portfolio

An interactive personal site about working across the security stack: a scanner-lens hero, an explorable timeline, a skill graph, and a hands-on security playground.

> Hosted on GitHub Pages at https://wooshied.github.io/ . See Deployment below.

## Quick start

Requires Node 18+ (tested on Node 26).

```bash
npm install
```

```bash
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

```bash
npm run build
```

```bash
npm run preview
```

`build` runs the TypeScript check and then outputs static files to `dist/`.

## Editing content

**Almost everything lives in one file: `src/content/profile.ts`.** Change text there; no component edits are needed.

| To… | Edit |
|---|---|
| Change the hero statement, stats, or "Now" card | `profile.hero` |
| Change the about text | `profile.about` |
| Edit a layer (name, color, work, results) | `profile.layers` |
| Add or edit a job | `profile.experience` (`lane` picks the timeline row) |
| Link a skill to where you used it | `profile.skills` (only real, backed links) |
| List a tool with no specific role | `profile.otherTools` |
| Move a certification | `status` "studying" to "earned" plus a `date` |
| Publish a lab write-up | fill a `caseStudies` entry, `state: "published"` |
| Edit the phishing game | `src/content/phish.ts` |
| Edit terminal commands | `src/components/playground/commands.ts` |
| Change the photo | replace `public/aadil.jpg` |
| Show email | `identity.email = { address: "...", approved: true }` |
| Add a résumé link | `public/resume-web.pdf` + `identity.resumeUrl` |
| Hide placeholders | `showPlaceholders: false` |

Everything in `src/` ships to the browser. **Never put private notes in `profile.ts`**; use `docs/`.

The workbench scenario lives in `src/content/workbench.ts`. It's entirely synthetic: `example.com` domains and RFC 5737 documentation IPs only.

## Project structure

```
index.html                  Page shell, meta, noscript fallback
public/                     aadil.jpg, favicon.svg, robots.txt (draft: disallow all)
src/
  main.tsx, App.tsx         Entry, section order, scroll reveals, card spotlight
  lib.ts                    Date math for the timeline
  content/
    profile.ts              ← ALL editable profile content
    phish.ts                ← Synthetic emails for Spot the phish
    workbench.ts            ← Synthetic alert-triage scenario
    types.ts
  components/
    Nav.tsx                 Terminal-path top bar, indicator, progress line
    Hero.tsx, Scanner.tsx   Bento hero; scanner lens over the name
    Timeline.tsx            Three-lane timeline (list on phones)
    SkillTrace.tsx          Skill → role graph with glowing lines
    Credentials.tsx, Contact.tsx, Footer.tsx, SectionHeader.tsx, ExternalLink.tsx
    playground/             Playground tabs, PhishSpotter, Terminal, commands
    workbench/              Alert triage (interactive + text version)
  hooks/                    useInView, useMediaQuery, useReducedMotion
  styles/                   tokens, base, site, playground, workbench
docs/                       Private, not built
```

## Deployment: GitHub Pages

Live at **https://wooshied.github.io/** from the `WooShied.github.io` repository.

`.github/workflows/deploy.yml` builds the site and publishes `dist/` on every push to `main`. To update the site, edit `src/content/profile.ts`, then commit and push:

```bash
git add -A
```

```bash
git commit -m "Update profile"
```

```bash
git push
```

The Actions tab on GitHub shows each deploy; the site updates about a minute later.

One-time setup (already done once): in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.

Not published (git-ignored): `docs/` (private audit notes), any PDF except `public/resume-web.pdf`, and build output.

GitHub Pages can't set custom response headers. If you later move to a host that can (Netlify, Cloudflare Pages), add:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Principles baked into the code

- Unverified results don't render (`status: "confirm"` stays hidden)
- Certifications are typed `earned | studying`, so studying can never be styled as earned
- No phone number or street address field exists in the content model
- Essential content never depends on animation: the scanner is decorative, every skill link is also written in the detail panel, and the workbench has a text version
