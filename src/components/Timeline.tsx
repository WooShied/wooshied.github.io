import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { profile } from "../content/profile";
import type { Lane, Role } from "../content/types";
import { monthIndex } from "../lib";
import { SectionHeader } from "./SectionHeader";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useReducedMotion } from "../hooks/useReducedMotion";

const LANE_ORDER: Lane[] = ["ops", "cyber", "lead"];
const LANE_COLOR: Record<Lane, string> = {
  ops: "#d6d6d6", // gray
  cyber: "#5eea8f", // brand green: the main lane
  lead: "#9c9c9c", // darker gray
};

const roles = profile.experience;
const chrono = [...roles].sort((a, b) => monthIndex(a.start) - monthIndex(b.start));
const startM = Math.min(...roles.map((r) => monthIndex(r.start))) - 2;
const endM = monthIndex("Present") + 3;
const span = endM - startM;
const pct = (m: number) => ((m - startM) / span) * 100;

/** Stack overlapping roles inside a lane into sub-rows. */
function laneRows(lane: Lane): Role[][] {
  const rows: Role[][] = [];
  roles
    .filter((r) => r.lane === lane)
    .sort((a, b) => monthIndex(a.start) - monthIndex(b.start))
    .forEach((r) => {
      const row = rows.find((rw) => rw.every((x) => monthIndex(x.end) <= monthIndex(r.start)));
      if (row) row.push(r);
      else rows.push([r]);
    });
  return rows;
}

function Detail({ role }: { role: Role }) {
  const color = LANE_COLOR[role.lane];
  return (
    <article className="tl-detail" style={{ ["--c" as string]: color }} aria-live="polite">
      <p className="tl-detail__when">
        {role.start} — {role.end}
        <span> · {profile.lanes[role.lane]}</span>
      </p>
      <h3 className="tl-detail__title">{role.title}</h3>
      <p className="tl-detail__org">
        {role.employer} · {role.location}
        {role.engagement ? ` · ${role.engagement}` : ""}
      </p>
      <p className="tl-detail__summary">{role.summary}</p>
      {role.services?.length ? (
        <ul className="tl-detail__services" aria-label="Services">
          {role.services.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ) : null}
      {role.pointsLabel ? <p className="tl-detail__label">{role.pointsLabel}</p> : null}
      <ul className="tl-detail__points">
        {role.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      {role.results?.some((r) => r.status === "verified") ? (
        <ul className="tl-detail__results" aria-label="Results">
          {role.results
            .filter((r) => r.status === "verified")
            .map((r) => (
              <li key={r.text}>{r.text}</li>
            ))}
        </ul>
      ) : null}
    </article>
  );
}

export function Timeline() {
  const [selected, setSelected] = useState(roles[0].id);
  const [playhead, setPlayhead] = useState(pct(monthIndex("Present")));
  const [playing, setPlaying] = useState(false);
  const mobile = useMediaQuery("(max-width: 760px)");
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const role = roles.find((r) => r.id === selected)!;

  const years = useMemo(() => {
    const out: number[] = [];
    for (let y = Math.ceil(startM / 12); y * 12 <= endM; y++) out.push(y);
    return out;
  }, []);

  // Pick the role under a given month; primary roles win ties.
  const roleAt = useCallback((m: number) => {
    const hits = roles.filter((r) => monthIndex(r.start) <= m && m <= monthIndex(r.end));
    return hits.sort((a, b) => (a.tier === b.tier ? monthIndex(b.start) - monthIndex(a.start) : a.tier === "primary" ? -1 : 1))[0];
  }, []);

  const select = (id: string, focus = false) => {
    setSelected(id);
    const r = roles.find((x) => x.id === id)!;
    setPlayhead(pct(monthIndex(r.start)));
    if (focus) btnRefs.current[id]?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    const i = chrono.findIndex((r) => r.id === selected);
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(chrono.length - 1, i + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(0, i - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = chrono.length - 1;
    else return;
    e.preventDefault();
    select(chrono[next].id, true);
  };

  // Drag across the chart to scrub through time.
  const scrubTo = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r) return;
    const p = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
    setPlayhead(p);
    const hit = roleAt(startM + (p / 100) * span);
    if (hit) setSelected(hit.id);
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    scrubTo(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) scrubTo(e.clientX);
  };

  // Replay: sweep the playhead from the first role to today.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const t0 = performance.now();
    const dur = 5200;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const m = startM + p * (monthIndex("Present") - startM);
      setPlayhead(pct(m));
      const hit = roleAt(m);
      if (hit) setSelected(hit.id);
      if (p < 1) raf = requestAnimationFrame(step);
      else setPlaying(false);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, roleAt]);

  return (
    <section id="timeline" className="section" aria-labelledby="timeline-title">
      <div className="wrap">
        <SectionHeader
          index="01"
          id="timeline"
          title="Timeline"
          kicker="Six years across operations, cyber, and engineering. Select a role, use the arrow keys, or drag across the chart."
          aside={
            !reduced && !mobile ? (
              <button type="button" className="pill" onClick={() => setPlaying(true)} disabled={playing}>
                {playing ? "Replaying…" : "▶ Replay"}
              </button>
            ) : null
          }
        />

        {mobile ? (
          <ol className="tl-list">
            {[...chrono].reverse().map((r) => (
              <li key={r.id} style={{ ["--c" as string]: LANE_COLOR[r.lane] }}>
                <button
                  type="button"
                  className="tl-list__btn"
                  aria-expanded={selected === r.id}
                  onClick={() => setSelected(r.id)}
                >
                  <span className="tl-list__when">
                    {r.start} — {r.end}
                  </span>
                  <span className="tl-list__title">{r.title}</span>
                  <span className="tl-list__org">{r.employer}</span>
                </button>
                {selected === r.id ? <Detail role={r} /> : null}
              </li>
            ))}
          </ol>
        ) : (
          <div className="tl card" data-reveal>
            <div className="tl__chart" onKeyDown={onKey}>
              <div className="tl__labels" aria-hidden="true">
                {LANE_ORDER.map((lane) => (
                  <div key={lane} className="tl__lane-label" style={{ ["--c" as string]: LANE_COLOR[lane], ["--rows" as string]: laneRows(lane).length }}>
                    <i />
                    {profile.lanes[lane]}
                  </div>
                ))}
              </div>
              <div
                className="tl__track"
                ref={trackRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                role="group"
                aria-label="Career timeline. Use arrow keys to move between roles."
              >
                <div className="tl__years" aria-hidden="true">
                  {years.map((y) => (
                    <span key={y} style={{ left: `${pct(y * 12)}%` }}>
                      {y}
                    </span>
                  ))}
                </div>
                {LANE_ORDER.map((lane) => (
                  <div key={lane} className="tl__lane" style={{ ["--c" as string]: LANE_COLOR[lane] }}>
                    {laneRows(lane).map((row, ri) => (
                      <div key={ri} className="tl__row">
                        {row.map((r) => {
                          const a = pct(monthIndex(r.start));
                          const b = pct(monthIndex(r.end));
                          const on = selected === r.id;
                          return (
                            <button
                              key={r.id}
                              ref={(el) => {
                                btnRefs.current[r.id] = el;
                              }}
                              type="button"
                              className="tl__bar"
                              data-on={on ? "true" : undefined}
                              data-present={r.end === "Present" ? "true" : undefined}
                              tabIndex={on ? 0 : -1}
                              aria-pressed={on}
                              title={`${r.title} · ${r.employer} · ${r.start} – ${r.end}`}
                              style={{ left: `${a}%`, width: `${Math.max(1.6, b - a)}%` }}
                              onClick={() => select(r.id)}
                            >
                              <span className="tl__bar-title">{r.title}</span>
                              <span className="tl__bar-org">{r.employer}</span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
                <div className="tl__now" style={{ left: `${pct(monthIndex("Present"))}%` }} aria-hidden="true">
                  <span>now</span>
                </div>
                <div className="tl__playhead" style={{ left: `${playhead}%` }} aria-hidden="true" />
              </div>
            </div>
            <Detail role={role} />
          </div>
        )}
      </div>
    </section>
  );
}
