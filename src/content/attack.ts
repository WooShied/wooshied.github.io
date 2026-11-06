/**
 * Attack replay scenario. ENTIRELY SYNTHETIC.
 * Hosts are made up; IPs use RFC 5737 documentation ranges.
 */

export type NodeId = "internet" | "mail" | "ws" | "fs" | "dc" | "cloud" | "soc";

export interface MapNode {
  id: NodeId;
  label: string;
  sub: string;
  x: number;
  y: number;
  /** External (attacker-side) nodes are drawn differently. */
  external?: boolean;
}

export interface Stage {
  id: string;
  name: string;
  time: string;
  what: string;
  /** Path the attacker traffic takes this stage (node ids, in order). */
  path: NodeId[];
  /** Nodes that become compromised by the end of this stage. */
  compromises: NodeId[];
  signal: { source: NodeId; severity: "Low" | "Medium" | "High"; text: string };
  /** What containing the attack at this stage looks like. */
  containAction: string;
  outcome: string;
  /** Rough blast radius 0..1 for the meter. */
  impact: number;
}

export const nodes: MapNode[] = [
  { id: "internet", label: "Attacker", sub: "198.51.100.23", x: 90, y: 230, external: true },
  { id: "mail", label: "Email gateway", sub: "mx.example.com", x: 270, y: 90 },
  { id: "ws", label: "Laptop WS-07", sub: "finance user", x: 450, y: 230 },
  { id: "fs", label: "File server", sub: "FS-02", x: 650, y: 230 },
  { id: "dc", label: "Domain controller", sub: "DC-01", x: 650, y: 400 },
  { id: "cloud", label: "Cloud storage", sub: "unknown account", x: 830, y: 90, external: true },
  { id: "soc", label: "SOC", sub: "alert queue", x: 270, y: 400 },
];

export const edges: [NodeId, NodeId][] = [
  ["internet", "mail"],
  ["mail", "ws"],
  ["ws", "internet"],
  ["ws", "fs"],
  ["fs", "cloud"],
  ["fs", "dc"],
  ["ws", "soc"],
  ["mail", "soc"],
  ["fs", "soc"],
];

export const stages: Stage[] = [
  {
    id: "delivery",
    name: "Phishing email lands",
    time: "Tue 09:14",
    what: "An invoice-themed email with a macro-enabled attachment reaches a finance user. The gateway scores it as low risk and delivers it.",
    path: ["internet", "mail", "ws"],
    compromises: [],
    signal: { source: "mail", severity: "Low", text: "Attachment with macros from a first-time sender" },
    containAction: "Pull the email from every inbox, block the sender, and check who opened it.",
    outcome: "Best possible outcome: nothing ran. But this signal is weak; it looks like hundreds of harmless emails every day, so it's easy to miss.",
    impact: 0.05,
  },
  {
    id: "execution",
    name: "Macro runs a script",
    time: "Tue 09:21",
    what: "The user opens the file and enables content. The macro starts a script that downloads a second-stage payload from the attacker's server.",
    path: ["ws", "internet"],
    compromises: ["ws"],
    signal: { source: "ws", severity: "Medium", text: "Office app spawned a scripting engine that made an outbound connection" },
    containAction: "Isolate WS-07 from the network, block 198.51.100.23, and rebuild the laptop.",
    outcome: "The sweet spot: a strong, specific signal and a blast radius of one laptop. No credentials lost.",
    impact: 0.15,
  },
  {
    id: "credentials",
    name: "Credentials stolen",
    time: "Tue 11:02",
    what: "The payload settles in with a scheduled task, then harvests credentials cached on the laptop, including an IT admin account that once signed in there.",
    path: ["ws"],
    compromises: ["ws"],
    signal: { source: "ws", severity: "High", text: "Unusual process reading credential memory; new scheduled task" },
    containAction: "Isolate WS-07, reset the IT admin account and every account cached on the laptop.",
    outcome: "Still contained to one host, but now there's real cleanup: every exposed credential has to be treated as compromised.",
    impact: 0.3,
  },
  {
    id: "lateral",
    name: "Moves to the file server",
    time: "Wed 03:12",
    what: "At 3 AM the attacker uses the stolen admin account to sign in to the file server from WS-07, a laptop that account has never used before.",
    path: ["ws", "fs"],
    compromises: ["ws", "fs"],
    signal: { source: "fs", severity: "High", text: "Admin sign-in from an unfamiliar host, off hours" },
    containAction: "Disable the admin account, isolate FS-02 and WS-07, and open a full incident.",
    outcome: "The attacker has admin rights on a server. Assume other systems were touched and start incident response.",
    impact: 0.55,
  },
  {
    id: "exfil",
    name: "Data leaves the network",
    time: "Wed 03:40",
    what: "The attacker compresses finance shares and uploads 4.2 GB to a cloud storage account the company doesn't own.",
    path: ["fs", "cloud"],
    compromises: ["ws", "fs"],
    signal: { source: "fs", severity: "High", text: "4.2 GB outbound to an unsanctioned cloud service" },
    containAction: "Cut outbound access, preserve evidence, and bring in legal and leadership.",
    outcome: "This is now a data breach: forensics, legal review, and possibly customer notification.",
    impact: 0.8,
  },
  {
    id: "impact",
    name: "Ransomware staged",
    time: "Wed 04:05",
    what: "Using the admin account, the attacker pushes ransomware to the domain controller to deploy across the company at 6 AM.",
    path: ["fs", "dc"],
    compromises: ["ws", "fs", "dc"],
    signal: { source: "fs", severity: "High", text: "New software deployment policy created outside change hours" },
    containAction: "Take the domain offline, activate the incident plan, and restore from offline backups.",
    outcome: "Worst case caught at the last minute. Recovery takes days, even with good backups.",
    impact: 1,
  },
];

export const takeaway =
  "Earlier is cheaper, but the earliest signal is rarely the clearest. Good detection means catching the first strong signal, here the script launched by an Office file, before the attacker gets credentials.";
