/**
 * ─────────────────────────────────────────────────────────────
 *  PROFILE CONTENT — the single file to edit.
 * ─────────────────────────────────────────────────────────────
 *  Sources: Aadil's résumé (GSOC edition), his LinkedIn (pasted
 *  2 Nov 2026), and his confirmations (docs/CONTENT-AUDIT.md §2, §2b).
 *
 *  Rules:
 *   - No phone number, no street address, ever.
 *   - Keep Anduril references at the level already public on LinkedIn.
 *   - Never mark a certification "earned" until it is.
 *   - Case studies stay "template" until real work exists.
 *   - Everything here ships to the browser. No private notes.
 */
import type { Profile } from "./types";

export const profile: Profile = {
  showPlaceholders: true,
  lastUpdated: "2026-11-05",

  identity: {
    name: "Aadil Rashid",
    location: "Orange County, California",
    links: {
      linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/aadilrashid/" },
      github: { label: "GitHub", href: "https://github.com/WooShied" },
    },
    email: { address: "", approved: false },
    resumeUrl: null,
    photo: { src: "./aadil.jpg", alt: "Aadil Rashid smiling on a pier, with the coast and mountains behind him" },
  },

  hero: {
    statement: ["Security is a layered problem.", "I'm curious about every layer."],
    sub: "From the camera feed to the codebase: security operations, cybersecurity analysis, and secure engineering.",
    now: {
      title: "GSOC Operations",
      org: "Anduril Industries",
      detail: "Threat detection, incident response, and protective intelligence in 24/7 operations.",
    },
    stats: [
      { value: null, word: "1st", label: "operator on the GSOC graveyard shift during its build-out" },
      { value: 30, suffix: "%", label: "fewer security incident tickets" },
      { value: 40, suffix: "%", label: "fewer unauthorized access incidents" },
      { value: null, word: "24/7", label: "GSOC operations: threat detection, incident response, protective intelligence" },
    ],
  },

  about: [
    "I came to security through code. Building web systems and APIs showed me how easily things break, and how much care it takes to make them hold.",
    "At The Rosslyn Group that became a dual role: assessing systems, running phishing simulations, and engineering the fixes. Today I work in a Global Security Operations Center, where events arrive in real time and decisions can't wait.",
    "What I love is the whole loop. Notice something. Reason about it. Act. Write it down. Then make the next one easier.",
  ],

  // Outermost (physical) to innermost (data). Colors run through the whole site.
  layers: [
    {
      id: "physical",
      name: "Physical",
      tagline: "Where security is visible.",
      color: "#facc15",
      work: [
        "First operator on the graveyard shift during the GSOC's initial build-out",
        "Threat detection, incident response, and protective intelligence in 24/7 operations",
        "Monitoring security systems, access control, and CCTV; triage and escalation",
        "Incident response protocols, drills, playbooks, and after-action reviews",
      ],
      where: "Anduril Industries · GSOC Operations",
    },
    {
      id: "network",
      name: "Network & platform",
      tagline: "Keep the ground floor patched and observable.",
      color: "#22d3ee",
      work: [
        "Security assessments across Google Drive, NextCloud, and Backupify",
        "Platform monitoring, patching, and support; Docker and Kubernetes",
        "GitLab CI/CD pipelines with automated security checks",
      ],
      where: "The Rosslyn Group · Comfort Cottages",
      highlight: ["20% better platform security scores"],
    },
    {
      id: "identity",
      name: "Identity & access",
      tagline: "Who gets in, and how we know.",
      color: "#a78bfa",
      work: [
        "Access control configuration across 5+ cloud platforms",
        "SAML and OAuth implementations",
        "Correlating physical and digital threat information with cybersecurity teams",
      ],
      where: "The Rosslyn Group · Anduril Industries",
      highlight: ["40% fewer unauthorized access incidents"],
    },
    {
      id: "application",
      name: "Application",
      tagline: "Security written into the code.",
      color: "#60a5fa",
      work: [
        "Secure application development and Spring Boot APIs",
        "Django and Flask backends; Express hardened with Helmet",
        "Dependency scanning with OWASP Dependency-Check",
      ],
      where: "The Rosslyn Group · Comfort Cottages",
    },
    {
      id: "data",
      name: "Data & people",
      tagline: "The asset at the center, and the people around it.",
      color: "#fb7185",
      work: [
        "Data protection protocols and secure authentication",
        "Phishing simulations and security awareness training",
        "Incident records, policy documentation, and installation guides",
      ],
      where: "The Rosslyn Group · STEM Heroes Academy · Anduril Industries",
      highlight: ["30% fewer security incident tickets", "25% fewer human-error incidents"],
    },
  ],

  lanes: {
    ops: "Security operations",
    cyber: "Cybersecurity & engineering",
    lead: "Operations & leadership",
  },

  experience: [
    {
      // Matches LinkedIn: contract Oct 2025 – Feb 2026, full-time since Feb 2026.
      id: "anduril-gsoc",
      employer: "Anduril Industries",
      title: "GSOC Operations",
      engagement: "Full-time since Feb 2026; contract Oct 2025 – Feb 2026",
      location: "Costa Mesa, CA",
      start: "Oct 2025",
      end: "Present",
      lane: "ops",
      tier: "primary",
      summary: "First operator on the graveyard shift during the initial build-out of the GSOC.",
      points: [
        "Threat detection, incident response, and protective intelligence in 24/7 operations",
        "Monitor security systems, access control, and CCTV; triage incidents and escalate when required",
        "Correlate physical and digital threat information with cybersecurity and operations teams",
        "Execute incident response protocols; contribute to after-action reviews, drills, and playbooks",
        "Maintain detailed logs and incident records for audits",
      ],
    },
    {
      id: "rosslyn",
      employer: "The Rosslyn Group",
      title: "Cybersecurity Analyst & Software Engineer",
      location: "Irvine, CA",
      start: "Aug 2022",
      end: "Jul 2025",
      lane: "cyber",
      tier: "primary",
      summary: "A dual role across security and engineering.",
      points: [
        "Security assessments across Google Drive, NextCloud, and Backupify",
        "Access control configuration across 5+ cloud platforms",
        "Phishing simulations, security awareness training, and data protection protocols",
        "Platform monitoring, patching, and CI/CD; security infrastructure and Spring Boot APIs; SAML and OAuth",
        "Automation in Python, Java, and JavaScript; standards, guides, and policy docs",
      ],
      results: [
        { text: "30% fewer security incident tickets", status: "verified" },
        { text: "40% fewer unauthorized access incidents", status: "verified" },
        { text: "25% fewer human-error incidents in the first quarter", status: "verified" },
        { text: "20% better platform security scores", status: "verified" },
      ],
    },
    {
      id: "comfort-cottages",
      employer: "Comfort Cottages",
      title: "Web Developer & Security Architect",
      engagement: "Contract, as needed",
      location: "Laguna Hills, CA",
      start: "Jul 2020",
      end: "Present",
      lane: "cyber",
      tier: "secondary",
      summary: "Secure, data-driven web systems for customer access, service tracking, and operations.",
      points: [
        "Django and SQL backend tools for intake, contact tracking, and lead pipelines",
        "Docker and Kubernetes; GitLab CI/CD with automated security checks",
        "Secure data-retrieval automation supporting cybersecurity analysts and intelligence operations",
      ],
    },
    {
      id: "awi",
      employer: "Art and Wilderness Institute",
      title: "Director of Marketing",
      engagement: "Contract",
      location: "Irvine, CA",
      start: "Feb 2025",
      end: "Aug 2025",
      lane: "lead",
      tier: "secondary",
      summary: "Analytics and strategy for digital engagement and community growth.",
      points: [
        "Built the organization's core web infrastructure and website",
        "Set up data tracking across social platforms and mailing lists",
        "Managed interns creating and maintaining content",
      ],
    },
    {
      id: "stem-heroes",
      employer: "STEM Heroes Academy",
      title: "Director of Operations & Program Manager",
      engagement: "Contract",
      location: "Irvine, CA",
      start: "Jun 2024",
      end: "Oct 2024",
      lane: "lead",
      tier: "secondary",
      summary: "Operational analytics and organizational improvements.",
      points: [
        "Built dashboards to track student progress and instructor productivity",
        "Led physical and digital security improvements, including student data protection",
      ],
    },
  ],

  // Each link here is backed by the résumé or LinkedIn. Unlinked tools go in otherTools.
  skills: [
    { name: "Security monitoring", layer: "physical", roles: ["anduril-gsoc"] },
    { name: "Access control & CCTV", layer: "physical", roles: ["anduril-gsoc"] },
    { name: "Incident response", layer: "physical", roles: ["anduril-gsoc"] },
    { name: "Protective intelligence", layer: "physical", roles: ["anduril-gsoc"] },
    { name: "Physical security upgrades", layer: "physical", roles: ["stem-heroes"] },

    { name: "Security assessments", layer: "network", roles: ["rosslyn"] },
    { name: "Patching & monitoring", layer: "network", roles: ["rosslyn"] },
    { name: "CI/CD security", layer: "network", roles: ["rosslyn", "comfort-cottages"] },
    { name: "Docker & Kubernetes", layer: "network", roles: ["comfort-cottages"] },

    { name: "Access control config", layer: "identity", roles: ["rosslyn"] },
    { name: "SAML & OAuth", layer: "identity", roles: ["rosslyn"] },
    { name: "Threat correlation", layer: "identity", roles: ["anduril-gsoc"] },

    { name: "Python", layer: "application", roles: ["rosslyn", "comfort-cottages"] },
    { name: "Java & Spring Boot", layer: "application", roles: ["rosslyn"] },
    { name: "JavaScript", layer: "application", roles: ["rosslyn"] },
    { name: "Django & SQL", layer: "application", roles: ["comfort-cottages"] },
    { name: "Web infrastructure", layer: "application", roles: ["awi"] },

    { name: "Data protection", layer: "data", roles: ["rosslyn", "stem-heroes"] },
    { name: "Phishing simulations", layer: "data", roles: ["rosslyn"] },
    { name: "Awareness training", layer: "data", roles: ["rosslyn"] },
    { name: "Incident documentation", layer: "data", roles: ["anduril-gsoc", "rosslyn"] },
    { name: "Dashboards & analytics", layer: "data", roles: ["stem-heroes", "awi"] },
  ],

  // Learned by doing. Every item is on the résumé or LinkedIn.
  ojt: [
    { title: "GSOC operator training & drills", detail: "Ongoing training, drills, and playbook work in a 24/7 Global Security Operations Center" },
    { title: "Incident response", detail: "Executing response protocols, coordinating stakeholders, and contributing to after-action reviews" },
    { title: "Threat detection & protective intelligence", detail: "Real-time monitoring, triage, and escalation on the GSOC floor" },
    { title: "Security assessments", detail: "Assessed cloud collaboration and backup platforms; 20% better platform security scores" },
    { title: "Access control engineering", detail: "Configured access across 5+ cloud platforms; 40% fewer unauthorized access incidents" },
    { title: "Phishing simulations & awareness training", detail: "Ran simulations and training; 25% fewer human-error incidents in the first quarter" },
    { title: "Secure software delivery", detail: "CI/CD pipelines with automated security checks, dependency scanning, SAML and OAuth" },
    { title: "Security documentation", detail: "Incident records for audits, security reports, installation guides, and policies" },
  ],

  // Tools used on the job (confirmed by Aadil 5 Nov 2026) plus the résumé's skills list.
  // Security-operations tools are deliberately not tied to an employer.
  toolbox: [
    { title: "Security operations", color: "#facc15", items: ["Splunk", "Dataminr", "AlertMedia", "Access control & CCTV platforms"] },
    { title: "Security engineering", color: "#a78bfa", items: ["SAML", "OAuth", "OWASP Dependency-Check", "Helmet", "PyCrypto / cryptography"] },
    { title: "Languages", color: "#60a5fa", items: ["Python", "Java", "JavaScript", "Node.js", "Dart", "Lua", "C / C++", "SQL", "HTML", "CSS"] },
    { title: "Frameworks", color: "#22d3ee", items: ["Flutter", "Django", "Flask", "Spring Boot", "Express", "Tailwind CSS", "Sass", "Pytest"] },
    { title: "Data & DevOps", color: "#fb7185", items: ["MySQL", "Git & GitHub", "GitLab CI/CD", "Docker", "Kubernetes", "Terraform", "Jenkins API", "Fabric", "Google Workspace"] },
  ],

  certifications: [
    { name: "CompTIA Security+", issuer: "CompTIA", date: "Feb 2025", status: "earned" },
    { name: "CISSP", issuer: "ISC2", status: "studying" },
    { name: "CISA", issuer: "ISACA", status: "studying" },
    { name: "PMP", issuer: "PMI", status: "studying" },
  ],

  // Slots for future lab write-ups. Nothing here is claimed as done.
  caseStudies: [
    { id: "auth-anomaly", title: "Authentication anomaly investigation", focus: "Identity", state: "template" },
    { id: "phishing", title: "Phishing email analysis", focus: "Email", state: "template" },
    { id: "windows-events", title: "Windows event-log investigation", focus: "Endpoint", state: "template" },
    { id: "siem-triage", title: "SIEM alert triage", focus: "Detection", state: "template" },
    { id: "detection-rule", title: "Detection rule development", focus: "Detection", state: "template" },
    { id: "network-traffic", title: "Network traffic investigation", focus: "Network", state: "template" },
  ],
};
