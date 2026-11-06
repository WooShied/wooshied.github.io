import {
  containment,
  decisions,
  hypotheses,
  keyEvidenceSummary,
  openQuestions,
  reference,
  type Confidence,
  type Severity,
} from "../../content/workbench";

export interface HandoffInput {
  hypothesis?: string;
  severity?: Severity;
  confidence?: Confidence;
  decision?: string;
  actions: string[];
  note: string;
}

/** Builds the shift-handoff note from the analyst's choices. Plain text, ready to paste. */
export function buildHandoff(s: HandoffInput): string {
  const dec = decisions.find((d) => d.id === s.decision);
  const hyp = hypotheses.find((h) => h.id === s.hypothesis);
  const chosen = containment.filter((c) => s.actions.includes(c.id));
  const missed = containment.filter((c) => c.recommended && !s.actions.includes(c.id));

  const lines: string[] = [
    "SHIFT HANDOFF · A-1042 · SYNTHETIC LAB DATA",
    "─".repeat(44),
    `Status:      ${dec ? dec.label : "Not decided"}`,
    `Severity:    ${s.severity ?? "—"}    Confidence: ${s.confidence ?? "—"}`,
    `Assessment:  ${hyp ? hyp.label : "Not recorded"}`,
    "Account:     r.castillo@example.com (Accounts Payable)",
    "",
    "Key evidence",
    ...keyEvidenceSummary.map((e) => `  - ${e}`),
    "",
    "Baseline",
    "  - Last normal sign-in Mon 16:47 PT, corporate network, known device",
    "  - No travel on file",
    "",
    "Ruled out",
    "  - User travel: denials preceded approval; no travel on file",
    "  - MFA outage: other users authenticated normally at 02:13",
    "",
    "Actions recommended",
    ...(chosen.length ? chosen.map((c) => `  - ${c.label}`) : ["  - None selected"]),
    "",
    "Open questions for IR",
    ...openQuestions.map((q) => `  - ${q}`),
  ];

  if (s.note.trim()) {
    lines.push("", "Analyst note", ...s.note.trim().split("\n").map((l) => `  ${l}`));
  }

  const review: string[] = [];
  if (s.severity && s.severity !== reference.severity) review.push(`reference severity is ${reference.severity}`);
  if (s.confidence && s.confidence !== reference.confidence) review.push(`reference confidence is ${reference.confidence}`);
  if (dec && !dec.correct) review.push("reference decision is escalate to incident response");
  missed.forEach((m) => review.push(`also recommended: ${m.label.toLowerCase()}`));
  const wrong = chosen.filter((c) => !c.recommended);
  wrong.forEach((w) => review.push(`reconsider: ${w.label.toLowerCase()}`));
  if (review.length) lines.push("", "Reviewer note", ...review.map((r) => `  - ${r}`));

  return lines.join("\n");
}
