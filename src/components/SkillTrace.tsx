import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { profile } from "../content/profile";
import type { LayerId } from "../content/types";
import { SectionHeader } from "./SectionHeader";
import { useReducedMotion } from "../hooks/useReducedMotion";

type Focus = { kind: "skill"; id: string } | { kind: "role"; id: string } | { kind: "layer"; id: LayerId };

const { layers, skills, experience } = profile;
const color = (l: LayerId) => layers.find((x) => x.id === l)!.color;
const roleById = (id: string) => experience.find((r) => r.id === id)!;
// Only roles that some skill actually links to, newest first.
const traceRoles = experience.filter((r) => skills.some((s) => s.roles.includes(r.id)));

interface Line {
  key: string;
  d: string;
  color: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Skills grouped by security layer, linked to the roles where they were used.
 * Hover, focus, or tap a skill, layer, or role; the links draw themselves.
 */
export function SkillTrace() {
  const [pinned, setPinned] = useState<Focus>({ kind: "role", id: experience[0].id });
  const [hover, setHover] = useState<Focus | null>(null);
  const focus = hover ?? pinned;
  const reduced = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const skillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const roleRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [lines, setLines] = useState<Line[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Which skills and roles are lit for the current focus.
  const { litSkills, litRoles } = useMemo(() => {
    let ls = new Set<string>();
    if (focus.kind === "skill") ls = new Set([focus.id]);
    if (focus.kind === "role") ls = new Set(skills.filter((s) => s.roles.includes(focus.id)).map((s) => s.name));
    if (focus.kind === "layer") ls = new Set(skills.filter((s) => s.layer === focus.id).map((s) => s.name));
    const lr = new Set<string>();
    skills.filter((s) => ls.has(s.name)).forEach((s) => s.roles.forEach((r) => lr.add(r)));
    if (focus.kind === "role") {
      lr.clear();
      lr.add(focus.id);
    }
    return { litSkills: ls, litRoles: lr };
  }, [focus]);

  const detailLayer: LayerId | null =
    focus.kind === "layer" ? focus.id : focus.kind === "skill" ? skills.find((s) => s.name === focus.id)!.layer : null;

  const measure = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    const b = box.getBoundingClientRect();
    setSize({ w: b.width, h: b.height });
    const out: Line[] = [];
    skills.forEach((s) => {
      if (!litSkills.has(s.name)) return;
      const se = skillRefs.current[s.name];
      if (!se || se.offsetParent === null) return;
      const sr = se.getBoundingClientRect();
      // Start at the layer card edge so the whole curve sits in the open gap.
      const cardRight = (se.closest(".trace__layer") as HTMLElement | null)?.getBoundingClientRect().right ?? sr.right;
      s.roles.forEach((rid) => {
        if (!litRoles.has(rid)) return;
        const re = roleRefs.current[rid];
        if (!re) return;
        const rr = re.getBoundingClientRect();
        const x1 = cardRight - b.left;
        const y1 = sr.top + sr.height / 2 - b.top;
        const x2 = rr.left - b.left;
        const y2 = rr.top + rr.height / 2 - b.top;
        if (x2 <= x1) return; // stacked layout: no lines
        const mx = (x1 + x2) / 2;
        out.push({ key: `${s.name}>${rid}`, d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`, color: color(s.layer), x1, y1, x2, y2 });
      });
    });
    setLines(out);
  }, [litSkills, litRoles]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (boxRef.current) ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const bind = (f: Focus) => ({
    onMouseEnter: () => setHover(f),
    onMouseLeave: () => setHover(null),
    onFocus: () => setHover(f),
    onBlur: () => setHover(null),
    onClick: () => setPinned(f),
  });

  const isPinned = (f: Focus) => pinned.kind === f.kind && pinned.id === f.id;

  return (
    <section id="layers" className="section" aria-labelledby="layers-title">
      <div className="wrap">
        <SectionHeader
          index="02"
          id="layers"
          title={
            <>
              Defense <span className="spectrum-text">in depth</span>
            </>
          }
          kicker="Good security is never one wall. Every skill below is tied to where I actually used it. Hover or tap a skill, a layer, or a role."
        />

        <div className="trace" ref={boxRef} data-reveal>
          <svg className="trace__lines" width={size.w} height={size.h} aria-hidden="true">
            <defs>
              <filter id="trace-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {lines.map((l) => (
              <g key={l.key} filter="url(#trace-glow)">
                <path d={l.d} stroke={l.color} className={reduced ? "trace__path" : "trace__path trace__path--draw"} />
                <circle cx={l.x1} cy={l.y1} r={3.5} fill={l.color} />
                <circle cx={l.x2} cy={l.y2} r={3.5} fill={l.color} />
              </g>
            ))}
          </svg>

          <div className="trace__layers">
            {layers.map((l, i) => {
              const fl: Focus = { kind: "layer", id: l.id };
              return (
                <div key={l.id} className="trace__layer" style={{ ["--c" as string]: l.color }}>
                  <button
                    type="button"
                    className="trace__layer-btn"
                    aria-pressed={isPinned(fl)}
                    data-lit={focus.kind === "layer" && focus.id === l.id ? "true" : undefined}
                    {...bind(fl)}
                  >
                    <span className="trace__layer-num">L{i + 1}</span>
                    {l.name}
                  </button>
                  <ul className="trace__skills">
                    {skills
                      .filter((s) => s.layer === l.id)
                      .map((s) => {
                        const fs: Focus = { kind: "skill", id: s.name };
                        return (
                          <li key={s.name}>
                            <button
                              type="button"
                              ref={(el) => {
                                skillRefs.current[s.name] = el;
                              }}
                              className="chip"
                              data-lit={litSkills.has(s.name) ? "true" : undefined}
                              aria-pressed={isPinned(fs)}
                              {...bind(fs)}
                            >
                              {s.name}
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="trace__roles">
            <p className="trace__col-label">Where</p>
            {traceRoles.map((r) => {
              const fr: Focus = { kind: "role", id: r.id };
              return (
                <button
                  key={r.id}
                  type="button"
                  ref={(el) => {
                    roleRefs.current[r.id] = el;
                  }}
                  className="trace__role"
                  data-lit={litRoles.has(r.id) ? "true" : undefined}
                  aria-pressed={isPinned(fr)}
                  {...bind(fr)}
                >
                  <span className="trace__role-title">{r.title}</span>
                  <span className="trace__role-org">{r.employer}</span>
                </button>
              );
            })}
          </div>

          <div className="trace__detail" aria-live="polite">
            {detailLayer ? (
              (() => {
                const l = layers.find((x) => x.id === detailLayer)!;
                return (
                  <div style={{ ["--c" as string]: l.color }}>
                    <p className="trace__detail-kicker">Layer · {l.name}</p>
                    <p className="trace__detail-title">{l.tagline}</p>
                    <ul className="trace__detail-list">
                      {l.work.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                    {l.highlight?.length ? (
                      <ul className="trace__detail-results">
                        {l.highlight.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })()
            ) : focus.kind === "role" ? (
              (() => {
                const r = roleById(focus.id);
                const used = skills.filter((s) => s.roles.includes(r.id));
                return (
                  <div>
                    <p className="trace__detail-kicker">
                      {r.employer} · {r.start} — {r.end}
                    </p>
                    <p className="trace__detail-title">{r.title}</p>
                    <p className="trace__detail-body">
                      {used.length} skills across{" "}
                      {new Set(used.map((s) => s.layer)).size} layers: {used.map((s) => s.name).join(", ")}.
                    </p>
                  </div>
                );
              })()
            ) : null}
          </div>
        </div>

        <p className="trace__more" data-reveal>
          <a href="#toolbox">See the full toolbox and on-the-job training ↓</a>
        </p>
      </div>
    </section>
  );
}
