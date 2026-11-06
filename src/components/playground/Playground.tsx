import { useRef, useState } from "react";
import { SectionHeader } from "../SectionHeader";
import { Workbench } from "../workbench/Workbench";
import { AttackReplay } from "./AttackReplay";
import { Terminal } from "./Terminal";
import { profile } from "../../content/profile";

type TabId = "triage" | "replay" | "terminal";

const TABS: { id: TabId; label: string; blurb: string; color: string }[] = [
  {
    id: "triage",
    label: "Triage an alert",
    blurb: "Take one suspicious sign-in from the queue to a written handoff. About three minutes.",
    color: profile.layers[2].color,
  },
  {
    id: "replay",
    label: "Attack replay",
    blurb: "Watch a synthetic intrusion move across a network, see what the SOC sees, and decide where to stop it.",
    color: profile.layers[4].color,
  },
  {
    id: "terminal",
    label: "Terminal",
    blurb: "A command line for this site, with a few real tools: SHA-256, Base64, and a privacy check.",
    color: profile.layers[1].color,
  },
];

export function Playground() {
  const [tab, setTab] = useState<TabId>("triage");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKey = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === tab);
    let n = i;
    if (e.key === "ArrowRight") n = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = TABS.length - 1;
    else return;
    e.preventDefault();
    setTab(TABS[n].id);
    refs.current[TABS[n].id]?.focus();
  };

  const goTab = (id: TabId) => {
    setTab(id);
    document.getElementById("playground")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="playground" className="section" aria-labelledby="playground-title">
      <div className="wrap">
        <SectionHeader
          index="03"
          id="playground"
          title="Playground"
          kicker="Three small things I built for fun. Everything runs in your browser on made-up data."
        />

        <div className="tabs" role="tablist" aria-label="Playground tools" onKeyDown={onKey} data-reveal>
          {TABS.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              className="tab"
              style={{ ["--c" as string]: t.color }}
              onClick={() => setTab(t.id)}
            >
              <span className="tab__num">0{i + 1}</span>
              <span className="tab__label">{t.label}</span>
              <span className="tab__blurb">{t.blurb}</span>
            </button>
          ))}
        </div>

        {TABS.map((t) => (
          <div
            key={t.id}
            role="tabpanel"
            id={`panel-${t.id}`}
            aria-labelledby={`tab-${t.id}`}
            hidden={tab !== t.id}
            className="panel"
            style={{ ["--c" as string]: t.color }}
          >
            {t.id === "triage" ? <Workbench /> : null}
            {t.id === "replay" ? <AttackReplay /> : null}
            {t.id === "terminal" ? <Terminal onTab={goTab} /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
