import { useEffect, useMemo, useState } from "react";
import { edges, nodes, stages, takeaway, type NodeId } from "../../content/attack";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const W = 150;
const H = 58;
const byId = Object.fromEntries(nodes.map((n) => [n.id, n])) as Record<NodeId, (typeof nodes)[number]>;
const SEV: Record<string, string> = { Low: "#8f8f9b", Medium: "#fbbf24", High: "#fb7185" };

/** Polyline through node centers, for traffic animation. */
const pathD = (ids: NodeId[]) =>
  ids.length < 2
    ? ""
    : ids.map((id, i) => `${i ? "L" : "M"}${byId[id].x},${byId[id].y}`).join(" ");

/**
 * Attack replay: a synthetic intrusion plays out across a small network.
 * Step through it, watch what the SOC would see, and decide where to contain it.
 */
export function AttackReplay() {
  const [idx, setIdx] = useState(0);
  const [contained, setContained] = useState<number | null>(null);
  const [ended, setEnded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const stage = stages[idx];
  const done = contained !== null || ended;

  // Auto-play steps forward every few seconds until contained or finished.
  useEffect(() => {
    if (!playing || done) return;
    const t = setTimeout(() => {
      if (idx < stages.length - 1) setIdx(idx + 1);
      else {
        setEnded(true);
        setPlaying(false);
      }
    }, 2600);
    return () => clearTimeout(t);
  }, [playing, idx, done]);

  const compromised = useMemo(() => {
    const last = contained ?? idx;
    const s = new Set<NodeId>();
    stages.slice(0, last + 1).forEach((st) => st.compromises.forEach((n) => s.add(n)));
    return s;
  }, [idx, contained]);

  const activeEdges = useMemo(() => {
    const set = new Set<string>();
    const upto = contained ?? idx;
    stages.slice(0, upto + 1).forEach((st) => {
      for (let i = 0; i < st.path.length - 1; i++) set.add(`${st.path[i]}>${st.path[i + 1]}`);
    });
    return set;
  }, [idx, contained]);

  const reset = () => {
    setIdx(0);
    setContained(null);
    setEnded(false);
    setPlaying(false);
  };

  const shown = contained ?? idx;
  const current = stages[shown];
  const isOn = (a: NodeId, b: NodeId) => activeEdges.has(`${a}>${b}`) || activeEdges.has(`${b}>${a}`);
  const alertEdge = (n: NodeId) => current.signal.source === n;

  return (
    <div className="ar">
      <div className="ar__map">
        <svg viewBox="0 0 920 480" role="img" aria-label={`Network map. Stage ${shown + 1}: ${current.name}.`}>
          <defs>
            <filter id="ar-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Network links */}
          {edges.map(([a, b]) => {
            const toSoc = b === "soc";
            const on = isOn(a, b);
            const alerting = toSoc && alertEdge(a);
            return (
              <line
                key={`${a}-${b}`}
                x1={byId[a].x}
                y1={byId[a].y}
                x2={byId[b].x}
                y2={byId[b].y}
                className="ar__edge"
                data-on={on ? "true" : undefined}
                data-alert={alerting ? "true" : undefined}
                style={alerting ? { stroke: SEV[current.signal.severity] } : undefined}
              />
            );
          })}

          {/* Attacker traffic for the current stage */}
          {!reduced && contained === null && !ended && stage.path.length > 1 ? (
            <circle r="6" className="ar__packet" filter="url(#ar-glow)">
              <animateMotion dur="1.6s" repeatCount="indefinite" path={pathD(stage.path)} />
            </circle>
          ) : null}

          {/* Alert flowing to the SOC */}
          {!reduced && !done ? (
            <circle r="5" fill={SEV[stage.signal.severity]} filter="url(#ar-glow)">
              <animateMotion dur="1.2s" repeatCount="indefinite" path={pathD([stage.signal.source, "soc"])} />
            </circle>
          ) : null}

          {/* Hosts */}
          {nodes.map((n) => {
            const bad = compromised.has(n.id);
            const isolated = contained !== null && bad && !n.external;
            const state = n.id === "soc" ? "soc" : isolated ? "isolated" : bad ? "bad" : n.external ? "ext" : "ok";
            return (
              <g key={n.id} transform={`translate(${n.x - W / 2}, ${n.y - H / 2})`} className="ar__node" data-state={state}>
                <rect width={W} height={H} rx="12" />
                <text x="14" y="25" className="ar__node-label">
                  {n.label}
                </text>
                <text x="14" y="43" className="ar__node-sub">
                  {isolated ? "isolated" : bad ? "compromised" : n.sub}
                </text>
                {bad && !isolated ? <circle cx={W - 14} cy="14" r="5" className="ar__ping" /> : null}
              </g>
            );
          })}
        </svg>

        <div className="ar__meter" aria-label={`Blast radius ${Math.round(current.impact * 100)} percent`}>
          <span>Blast radius</span>
          <div className="ar__meter-track">
            <div className="ar__meter-fill" style={{ width: `${current.impact * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="ar__panel">
        <ol className="ar__steps" aria-label="Attack stages">
          {stages.map((s, i) => {
            const prevented = contained !== null && i > contained;
            const reached = i <= idx;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className="ar__step"
                  aria-current={i === shown ? "step" : undefined}
                  data-prevented={prevented ? "true" : undefined}
                  disabled={!reached || contained !== null}
                  onClick={() => setIdx(i)}
                >
                  <span className="ar__step-num">{i + 1}</span>
                  <span className="ar__step-name">{s.name}</span>
                  <span className="ar__step-time">{prevented ? "prevented" : s.time}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div aria-live="polite">
          {!done ? (
            <div className="ar__detail">
              <p className="ar__kicker">
                Stage {idx + 1} of {stages.length} · {stage.time}
              </p>
              <h4 className="ar__title">{stage.name}</h4>
              <p className="ar__what">{stage.what}</p>
              <p className="ar__signal" style={{ ["--sev" as string]: SEV[stage.signal.severity] }}>
                <span className="ar__sev">{stage.signal.severity}</span>
                SOC sees: {stage.signal.text}
              </p>
            </div>
          ) : (
            <div className={`ar__outcome ${contained !== null ? "is-contained" : "is-lost"}`}>
              <p className="ar__kicker">
                {contained !== null ? `Contained at stage ${contained + 1}` : "Not contained"}
              </p>
              <h4 className="ar__title">{current.name}</h4>
              <p>
                <strong>Response:</strong> {current.containAction}
              </p>
              <p>{current.outcome}</p>
              <p className="ar__takeaway">{takeaway}</p>
            </div>
          )}
        </div>

        <div className="ar__actions">
          {!done ? (
            <>
              <button type="button" className="pill pill--danger" onClick={() => { setPlaying(false); setContained(idx); }}>
                Contain here
              </button>
              <button
                type="button"
                className="pill"
                onClick={() => {
                  setPlaying(false);
                  if (idx < stages.length - 1) setIdx(idx + 1);
                  else setEnded(true);
                }}
              >
                {idx < stages.length - 1 ? "Let it continue →" : "Let it finish"}
              </button>
              {!reduced ? (
                <button type="button" className="pill" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
                  {playing ? "Pause" : "▶ Auto-play"}
                </button>
              ) : null}
            </>
          ) : (
            <button type="button" className="pill pill--solid" onClick={reset}>
              Replay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
