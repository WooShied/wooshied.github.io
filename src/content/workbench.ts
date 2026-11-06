/**
 * SOC workbench scenario. ENTIRELY SYNTHETIC.
 * Domains use example.com and IPs use documentation ranges
 * (RFC 5737: 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24)
 * so nothing can match a real organization or system.
 */

export type Severity = "Low" | "Medium" | "High" | "Critical";
export type Confidence = "Low" | "Medium" | "High";
export type EventClass = "evidence" | "baseline" | "noise";

export const DISCLAIMER =
  "Interactive lab demonstration using synthetic data. Not a representation of any employer's systems or incidents.";

export interface QueueAlert {
  id: string;
  title: string;
  severity: Severity | "Info";
  time: string;
  entity: string;
  isPrimary: boolean;
  /** Quick disposition shown when a secondary alert is opened. */
  disposition?: string;
  triageNote: string;
}

export const queue: QueueAlert[] = [
  {
    id: "A-1042",
    title: "Repeated MFA push denials followed by approval",
    severity: "High",
    time: "02:19 PT",
    entity: "r.castillo@example.com",
    isPrimary: true,
    triageNote:
      "Right call. It's the only alert that shows a successful sign-in after suspicious activity, so an attacker may be active in the account now.",
  },
  {
    id: "A-1036",
    title: "Password spray against VPN portal",
    severity: "Medium",
    time: "01:52 PT",
    entity: "192.0.2.77 → 40 accounts",
    isPrimary: false,
    disposition:
      "Monitor. One attempt per account, all failed, and the gateway already blocked the source. Confirm there were no successful sign-ins from 192.0.2.77 and add it to the watchlist.",
    triageNote:
      "Worth checking, but every attempt failed and the source is blocked. A-1042 has a successful sign-in, so it comes first.",
  },
  {
    id: "A-1039",
    title: "Sign-in from new device",
    severity: "Low",
    time: "01:30 PT",
    entity: "t.nguyen@example.com",
    isPrimary: false,
    disposition:
      "Close as expected activity. An IT ticket shows a laptop replacement yesterday; the sign-in came from the corporate network and passed MFA on the user's registered phone.",
    triageNote:
      "Reasonable to glance at, but it has a clear benign explanation. A-1042 has a likely compromise in progress.",
  },
  {
    id: "A-1031",
    title: "Antivirus definitions updated on 212 hosts",
    severity: "Info",
    time: "01:05 PT",
    entity: "Endpoint fleet",
    isPrimary: false,
    disposition: "No action. Routine informational event.",
    triageNote: "Informational only. Always work the highest-risk alert first: A-1042.",
  },
];

export interface TimelineEvent {
  id: string;
  time: string;
  source: string;
  summary: string;
  detail: string;
  answer: EventClass;
  reasoning: string;
}

export const timeline: TimelineEvent[] = [
  {
    id: "e0",
    time: "Directory",
    source: "Identity directory",
    summary: "r.castillo: Accounts Payable, Irvine office. No travel on file.",
    detail: "Role: AP Specialist · Manager: d.okafor · Registered MFA device: one phone",
    answer: "baseline",
    reasoning:
      "Not suspicious by itself, but it matters. A finance user is a common target for payment fraud, and no travel on file makes a foreign sign-in harder to explain.",
  },
  {
    id: "e1",
    time: "Mon 16:47",
    source: "Identity provider",
    summary: "Sign-in success from corporate network, known device.",
    detail: "IP 198.51.100.20 (corporate egress, Irvine) · Windows laptop · MFA approved",
    answer: "baseline",
    reasoning: "This is normal behavior. It sets the baseline the later activity departs from.",
  },
  {
    id: "e2",
    time: "Tue 02:09",
    source: "Identity provider",
    summary: "Correct password entered. MFA push sent to user's phone.",
    detail: "IP 203.0.113.45 (hosting provider, Frankfurt DE) · new device · Linux browser",
    answer: "evidence",
    reasoning:
      "The password worked, from a hosting-provider address in another country, on a device never seen before, at 2 AM local time. The password is likely already compromised.",
  },
  {
    id: "e3",
    time: "02:10–02:18",
    source: "MFA service",
    summary: "7 push requests: 4 denied by user, 3 timed out.",
    detail: "All requests originated from the 203.0.113.45 session",
    answer: "evidence",
    reasoning:
      "Repeated prompts in the middle of the night are a known tactic called MFA fatigue: keep pushing until the user taps Approve to make it stop.",
  },
  {
    id: "e4",
    time: "02:13",
    source: "Identity provider",
    summary: "a.patel: one failed sign-in, then success a minute later.",
    detail: "IP 198.51.100.20 (corporate egress) · known device · MFA approved normally",
    answer: "noise",
    reasoning:
      "A different user mistyping a password on a known device. Unrelated, but useful later: it shows the MFA service was working normally at that time.",
  },
  {
    id: "e5",
    time: "02:15",
    source: "Mail system",
    summary: "Automated password-expiry reminder sent to r.castillo.",
    detail: "Scheduled notice · 14 days until expiry",
    answer: "noise",
    reasoning: "A routine scheduled email. It looks related because it mentions passwords, but it isn't.",
  },
  {
    id: "e6",
    time: "02:19",
    source: "MFA service",
    summary: "Push approved. Session token issued to the new device.",
    detail: "IP 203.0.113.45 · new device · session ID ending 7f3a",
    answer: "evidence",
    reasoning: "The approval after a run of denials is the moment the account was likely handed over.",
  },
  {
    id: "e7",
    time: "02:21",
    source: "Backup service",
    summary: "Nightly backup completed on file server FS-02.",
    detail: "Scheduled job · completed in 41 min",
    answer: "noise",
    reasoning: "Routine scheduled job. Nothing to do with the account.",
  },
  {
    id: "e8",
    time: "02:23",
    source: "Mail system",
    summary: "New inbox rule hides messages containing \"invoice\" or \"payment\".",
    detail: "Rule moves matching mail to \"RSS Subscriptions\" and marks it read · created from session 7f3a",
    answer: "evidence",
    reasoning:
      "Four minutes after access, someone made sure the real user won't see payment-related replies. That is a classic setup for invoice or payment fraud.",
  },
  {
    id: "e9",
    time: "02:24",
    source: "Mail system",
    summary: "Mailbox search for \"wire\" from the same session.",
    detail: "Search executed from session 7f3a · 23 results",
    answer: "evidence",
    reasoning: "The session is looking for payment conversations to hijack. This supports the fraud hypothesis.",
  },
];

export interface Hypothesis {
  id: string;
  label: string;
  correct: boolean;
  feedback: string;
}

export const hypotheses: Hypothesis[] = [
  {
    id: "takeover",
    label: "Likely account takeover through MFA fatigue",
    correct: true,
    feedback:
      "Matches every piece of evidence: valid password from an unfamiliar host, repeated pushes, approval, then an inbox rule and a search aimed at payments.",
  },
  {
    id: "travel",
    label: "User is traveling and approved their own sign-in",
    correct: false,
    feedback:
      "Unlikely. No travel is on file, the last normal sign-in was in Irvine nine hours earlier, and a traveling user wouldn't deny their own prompt four times.",
  },
  {
    id: "outage",
    label: "False positive caused by an MFA service problem",
    correct: false,
    feedback:
      "Ruled out by the noise. a.patel signed in normally through the same MFA service at 02:13, so the service was working.",
  },
];

export const reference = {
  severity: "High" as Severity,
  confidence: "High" as Confidence,
  severityRationale: {
    Low: "Too low. A successful sign-in followed by mailbox tampering needs action now, not a review queue.",
    Medium:
      "Under-calls it. We have more than suspicious sign-ins: we have post-access actions aimed at payments.",
    High: "Matches the reference. Confirmed takeover of a finance mailbox with fraud-setup activity, but no evidence yet that money moved or data left at scale.",
    Critical:
      "Defensible if your severity matrix treats any finance-account takeover as Critical. The reference holds at High until IR confirms mail was sent or payment details changed.",
  } as Record<Severity, string>,
  confidenceRationale: {
    Low: "The evidence is consistent and specific. Low confidence would understate it.",
    Medium: "Reasonable caution, but the inbox rule and search remove most doubt.",
    High: "Matches the reference. Several independent signals point the same way and the alternatives are ruled out.",
  } as Record<Confidence, string>,
};

export interface DecisionOption {
  id: "close" | "monitor" | "escalate";
  label: string;
  correct: boolean;
  feedback: string;
}

export const decisions: DecisionOption[] = [
  {
    id: "close",
    label: "Close as benign",
    correct: false,
    feedback: "Closing would leave an attacker in a finance mailbox. The evidence doesn't support a benign explanation.",
  },
  {
    id: "monitor",
    label: "Monitor and re-check later",
    correct: false,
    feedback: "Watching gives the attacker time. Once an inbox rule like this exists, the fraud attempt may already be underway.",
  },
  {
    id: "escalate",
    label: "Escalate to incident response",
    correct: true,
    feedback: "Correct. Escalate now, with the evidence and a containment recommendation attached.",
  },
];

export interface ContainmentAction {
  id: string;
  label: string;
  recommended: boolean;
  reasoning: string;
}

export const containment: ContainmentAction[] = [
  { id: "revoke", label: "Revoke active sessions and tokens for r.castillo", recommended: true, reasoning: "Cuts off the attacker's current access immediately." },
  { id: "reset", label: "Reset the password and re-register MFA", recommended: true, reasoning: "The password is compromised; re-registration removes any device the attacker added." },
  { id: "rule", label: "Export the inbox rule as evidence, then remove it", recommended: true, reasoning: "Preserve first, then restore the user's visibility of payment mail." },
  { id: "block", label: "Block 203.0.113.45 at the identity provider", recommended: true, reasoning: "Stops repeat attempts from the same source. Expect the attacker to rotate, so it's one layer, not the fix." },
  { id: "contact", label: "Contact the user by phone or in person", recommended: true, reasoning: "Confirms whether they approved the prompt and warns them, without using the compromised mailbox." },
  { id: "review", label: "Review sent mail and payment-detail changes since 02:09", recommended: true, reasoning: "Answers the key open question for IR: did anything leave, or did any payment change?" },
  { id: "delete", label: "Delete the user account", recommended: false, reasoning: "Destroys evidence and blocks a legitimate employee. Disabling temporarily is enough." },
  { id: "reimage", label: "Reimage the user's laptop", recommended: false, reasoning: "No sign of endpoint compromise. The sign-in came from a different device in another country." },
  { id: "email", label: "Email the user a warning", recommended: false, reasoning: "The attacker can read that mailbox. Use an out-of-band channel." },
];

export const keyEvidenceSummary = [
  "02:09 PT: correct password from 203.0.113.45 (hosting provider, DE), new Linux device",
  "02:10–02:18: 7 MFA pushes (4 denied, 3 timed out); approved 02:19",
  "02:23: inbox rule hides \"invoice\"/\"payment\" mail; 02:24: mailbox search for \"wire\"",
];

export const openQuestions = [
  "Was any mail sent, or any payment detail changed, from the account since 02:09?",
  "Did the user approve the prompt knowingly, by mistake, or under social engineering?",
  "Are other users seeing MFA prompts from the same source range?",
];
