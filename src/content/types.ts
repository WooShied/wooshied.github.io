// Shapes for everything in profile.ts. Edit content there, not here.

/**
 * - "verified": stated on the résumé/LinkedIn or confirmed by Aadil
 * - "confirm":  drafted; Aadil must approve before launch (never rendered)
 */
export type Verification = "verified" | "confirm";

export interface Link {
  label: string;
  href: string;
}

export interface Identity {
  name: string;
  /** Public region only. Never a street address. */
  location: string;
  links: { linkedin: Link; github: Link };
  /** Shown only when approved is true. */
  email: { address: string; approved: boolean };
  /** A web-safe résumé (no phone or address). null hides the link. */
  resumeUrl: string | null;
  photo: { src: string | null; alt: string };
}

export interface Stat {
  /** Number to count up to, or null for a word-only stat. */
  value: number | null;
  prefix?: string;
  suffix?: string;
  /** Shown instead of a number when value is null. */
  word?: string;
  label: string;
}

export interface Hero {
  /** Plain part of the statement, then the emphasised part. */
  statement: [string, string];
  sub: string;
  now: { title: string; org: string; detail: string };
  stats: Stat[];
}

export type LayerId = "physical" | "network" | "identity" | "application" | "data";

/** One layer of the defense-in-depth stack, outermost first. */
export interface Layer {
  id: LayerId;
  name: string;
  tagline: string;
  /** CSS color for this layer. Used across the site. */
  color: string;
  work: string[];
  where: string;
  highlight?: string[];
}

export type Lane = "ops" | "cyber" | "lead";

export interface Role {
  id: string;
  employer: string;
  title: string;
  engagement?: string;
  location: string;
  /** "Mon YYYY" */
  start: string;
  /** "Mon YYYY" or "Present" */
  end: string;
  lane: Lane;
  /** primary roles get full treatment; secondary roles are shorter. */
  tier: "primary" | "secondary";
  summary: string;
  points: string[];
  /** Measurable results. Only shown when status is "verified". */
  results?: { text: string; status: Verification }[];
}

/** A skill and where it was actually used. Only résumé/LinkedIn-backed links. */
export interface TracedSkill {
  name: string;
  layer: LayerId;
  roles: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
  status: "earned" | "studying";
}

export interface CaseStudy {
  id: string;
  title: string;
  focus: string;
  /** "template" = slot reserved; nothing claimed until real work is provided. */
  state: "template" | "published";
  problem?: string;
  environment?: string;
  dataSource?: string;
  process?: string[];
  findings?: string[];
  decision?: string;
  outcome?: string;
  lessons?: string[];
  tools?: string[];
  artifacts?: { src: string; alt: string; caption: string }[];
  repo?: string;
}

export interface Profile {
  /** Set false before launch to hide "next on the bench" placeholders. */
  showPlaceholders: boolean;
  lastUpdated: string;
  identity: Identity;
  hero: Hero;
  /** About text. Each string is a paragraph. */
  about: string[];
  layers: Layer[];
  lanes: Record<Lane, string>;
  experience: Role[];
  skills: TracedSkill[];
  /** Hands-on experience gained on the job (résumé/LinkedIn-backed). */
  ojt: { title: string; detail: string }[];
  /** Every tool Aadil has used, grouped. Confirmed by Aadil or on the résumé. */
  toolbox: { title: string; color: string; items: string[] }[];
  certifications: Certification[];
  caseStudies: CaseStudy[];
}
