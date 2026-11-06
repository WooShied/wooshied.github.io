import { useEffect, useMemo, useRef, useState } from "react";
import {
  DISCLAIMER,
  containment,
  decisions,
  hypotheses,
  queue,
  reference,
  timeline,
  type Confidence,
  type EventClass,
  type Severity,
} from "../../content/workbench";
import { buildHandoff } from "./handoff";
import { WorkbenchText } from "./WorkbenchText";

const STEPS = ["Queue", "Timeline", "Assess", "Decide", "Handoff"] as const;
const SEVERITIES: Severity[] = ["Low", "Medium", "High", "Critical"];
const CONFIDENCES: Confidence[] = ["Low", "Medium", "High"];
const CLASSES: { id: EventClass; label: string }[] = [
  { id: "evidence", label: "Evidence" },
  { id: "baseline", label: "Baseline" },
  { id: "noise", label: "Noise" },
];

function sevClass(s: string) {
  return `sev sev--${s.toLowerCase()}`;
}

export function Workbench() {
  const [mode, setMode] = useState<"interactive" | "text">("interactive");
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [picked, setPicked] = useState<string>();
  const [sorted, setSorted] = useState<Record<string, EventClass>>({});
  const [checked, setChecked] = useState(false);
  const [hyp, setHyp] = useState<string>();
  const [sev, setSev] = useState<Severity>();
  const [conf, setConf] = useState<Confidence>();
  const [dec, setDec] = useState<string>();
  const [actions, setActions] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prevStep = useRef(0);

  // Move focus to the new step's heading, but only after a real step change.
  useEffect(() => {
    if (prevStep.current === step) return;
    prevStep.current = step;
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: "nearest" });
  }, [step]);

  const go = (n: number) => {
    setStep(n);
    setMaxStep((m) => Math.max(m, n));
  };

  const reset = () => {
    setStep(0);
    setMaxStep(0);
    setPicked(undefined);
    setSorted({});
    setChecked(false);
    setHyp(undefined);
    setSev(undefined);
    setConf(undefined);
    setDec(undefined);
    setActions([]);
    setReviewed(false);
    setNote("");
  };

  const score = useMemo(() => timeline.filter((e) => sorted[e.id] === e.answer).length, [sorted]);
  const allSorted = timeline.every((e) => sorted[e.id]);
  const handoff = useMemo(
    () => buildHandoff({ hypothesis: hyp, severity: sev, confidence: conf, decision: dec, actions, note }),
    [hyp, sev, conf, dec, actions, note],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(handoff);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const pickedAlert = queue.find((q) => q.id === picked);
  const hypObj = hypotheses.find((h) => h.id === hyp);
  const decObj = decisions.find((d) => d.id === dec);

  return (
    <div className="wb-scope">
      <div>
        <p className="wb-disclaimer" role="note">
          <span className="label">Synthetic</span>
          {DISCLAIMER}
        </p>

        <div className="seg seg--mode" role="group" aria-label="Workbench view">
          <button type="button" aria-pressed={mode === "interactive"} onClick={() => setMode("interactive")}>
            Interactive
          </button>
          <button type="button" aria-pressed={mode === "text"} onClick={() => setMode("text")}>
            Read as case file
          </button>
        </div>

        {mode === "text" ? (
          <WorkbenchText />
        ) : (
          <div className="wb">
            <ol className="wb-steps" aria-label="Progress">
              {STEPS.map((s, i) => (
                <li key={s}>
                  <button
                    type="button"
                    className="wb-steps__btn"
                    disabled={i > maxStep}
                    aria-current={i === step ? "step" : undefined}
                    onClick={() => go(i)}
                  >
                    <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                    {s}
                  </button>
                </li>
              ))}
            </ol>

            <div className="wb-body">
              <div className="wb-main">
                {/* ── 1. Queue ─────────────────────────── */}
                {step === 0 && (
                  <div className="wb-panel">
                    <h3 ref={headingRef} tabIndex={-1} className="wb-panel__title">
                      Four alerts are waiting. Which do you work first?
                    </h3>
                    <fieldset className="wb-queue">
                      <legend className="sr-only">Alert queue</legend>
                      {queue.map((a) => (
                        <label key={a.id} className="wb-alert" data-selected={picked === a.id}>
                          <input
                            type="radio"
                            name="alert"
                            value={a.id}
                            checked={picked === a.id}
                            onChange={() => setPicked(a.id)}
                          />
                          <span className={sevClass(a.severity)}>{a.severity}</span>
                          <span className="wb-alert__title">{a.title}</span>
                          <span className="mono wb-alert__meta">
                            {a.id} · {a.time} · {a.entity}
                          </span>
                        </label>
                      ))}
                    </fieldset>
                    <div aria-live="polite">
                      {pickedAlert && (
                        <div className={`wb-feedback ${pickedAlert.isPrimary ? "is-good" : "is-note"}`}>
                          <p>{pickedAlert.triageNote}</p>
                          {pickedAlert.disposition && (
                            <p className="wb-feedback__sub">
                              <span className="label">Quick disposition</span> {pickedAlert.disposition}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="wb-nav">
                      <button type="button" className="btn btn--primary" disabled={!picked} onClick={() => go(1)}>
                        Open A-1042 <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ── 2. Timeline ──────────────────────── */}
                {step === 1 && (
                  <div className="wb-panel">
                    <h3 ref={headingRef} tabIndex={-1} className="wb-panel__title">
                      Separate the evidence from the noise.
                    </h3>
                    <p className="wb-panel__hint">
                      Mark each event. <strong>Evidence</strong> supports the alert. <strong>Baseline</strong> shows
                      what normal looks like. <strong>Noise</strong> is unrelated.
                    </p>
                    <ol className="wb-timeline">
                      {timeline.map((e) => {
                        const mine = sorted[e.id];
                        const right = checked && mine === e.answer;
                        const wrong = checked && mine !== e.answer;
                        return (
                          <li key={e.id} className="wb-event" data-state={checked ? (right ? "right" : "wrong") : undefined}>
                            <div className="wb-event__head">
                              <span className="mono wb-event__time">{e.time}</span>
                              <span className="label">{e.source}</span>
                            </div>
                            <p className="wb-event__summary">{e.summary}</p>
                            <p className="mono wb-event__detail">{e.detail}</p>
                            <fieldset className="seg seg--small" disabled={checked}>
                              <legend className="sr-only">Classify: {e.summary}</legend>
                              {CLASSES.map((c) => (
                                <label key={c.id} data-checked={mine === c.id}>
                                  <input
                                    type="radio"
                                    name={`cls-${e.id}`}
                                    value={c.id}
                                    checked={mine === c.id}
                                    onChange={() => setSorted((s) => ({ ...s, [e.id]: c.id }))}
                                  />
                                  {c.label}
                                </label>
                              ))}
                            </fieldset>
                            {checked && (
                              <p className="wb-event__why">
                                <span className="label">
                                  {right ? "Match" : wrong ? `Reference: ${e.answer}` : ""}
                                </span>{" "}
                                {e.reasoning}
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                    <div aria-live="polite">
                      {checked && (
                        <div className="wb-feedback is-good">
                          <p>
                            {score} of {timeline.length} match the reference. Five events tell the story, two set the baseline,
                            and three are noise you can safely set aside.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="wb-nav">
                      {!checked ? (
                        <>
                          <button type="button" className="btn btn--primary" disabled={!allSorted} onClick={() => setChecked(true)}>
                            Check my sorting
                          </button>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => {
                              setSorted(Object.fromEntries(timeline.map((e) => [e.id, e.answer])));
                              setChecked(true);
                            }}
                          >
                            Show the reference
                          </button>
                        </>
                      ) : (
                        <button type="button" className="btn btn--primary" onClick={() => go(2)}>
                          Assess <span aria-hidden="true">→</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── 3. Assess ────────────────────────── */}
                {step === 2 && (
                  <div className="wb-panel">
                    <h3 ref={headingRef} tabIndex={-1} className="wb-panel__title">
                      What do you think happened, and how bad is it?
                    </h3>

                    <fieldset className="wb-field">
                      <legend className="label">Initial assessment</legend>
                      <div className="wb-options">
                        {hypotheses.map((h) => (
                          <label key={h.id} className="wb-option" data-selected={hyp === h.id}>
                            <input type="radio" name="hyp" checked={hyp === h.id} onChange={() => setHyp(h.id)} />
                            {h.label}
                          </label>
                        ))}
                      </div>
                      <div aria-live="polite">
                        {hypObj && <p className={`wb-feedback ${hypObj.correct ? "is-good" : "is-note"}`}>{hypObj.feedback}</p>}
                      </div>
                    </fieldset>

                    <div className="wb-two">
                      <fieldset className="wb-field">
                        <legend className="label">Severity</legend>
                        <div className="seg">
                          {SEVERITIES.map((s) => (
                            <label key={s} data-checked={sev === s}>
                              <input type="radio" name="sev" checked={sev === s} onChange={() => setSev(s)} />
                              {s}
                            </label>
                          ))}
                        </div>
                        <div aria-live="polite">
                          {sev && (
                            <p className={`wb-feedback ${sev === reference.severity ? "is-good" : "is-note"}`}>
                              {reference.severityRationale[sev]}
                            </p>
                          )}
                        </div>
                      </fieldset>
                      <fieldset className="wb-field">
                        <legend className="label">Confidence</legend>
                        <div className="seg">
                          {CONFIDENCES.map((c) => (
                            <label key={c} data-checked={conf === c}>
                              <input type="radio" name="conf" checked={conf === c} onChange={() => setConf(c)} />
                              {c}
                            </label>
                          ))}
                        </div>
                        <div aria-live="polite">
                          {conf && (
                            <p className={`wb-feedback ${conf === reference.confidence ? "is-good" : "is-note"}`}>
                              {reference.confidenceRationale[conf]}
                            </p>
                          )}
                        </div>
                      </fieldset>
                    </div>

                    <div className="wb-nav">
                      <button type="button" className="btn btn--primary" disabled={!hyp || !sev || !conf} onClick={() => go(3)}>
                        Decide <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ── 4. Decide ────────────────────────── */}
                {step === 3 && (
                  <div className="wb-panel">
                    <h3 ref={headingRef} tabIndex={-1} className="wb-panel__title">
                      Close, monitor, or escalate? Then recommend containment.
                    </h3>
                    <fieldset className="wb-field">
                      <legend className="label">Decision</legend>
                      <div className="seg">
                        {decisions.map((d) => (
                          <label key={d.id} data-checked={dec === d.id}>
                            <input type="radio" name="dec" checked={dec === d.id} onChange={() => setDec(d.id)} />
                            {d.label}
                          </label>
                        ))}
                      </div>
                      <div aria-live="polite">
                        {decObj && <p className={`wb-feedback ${decObj.correct ? "is-good" : "is-note"}`}>{decObj.feedback}</p>}
                      </div>
                    </fieldset>

                    <fieldset className="wb-field">
                      <legend className="label">Containment recommendations · choose all that apply</legend>
                      <ul className="wb-checks">
                        {containment.map((c) => {
                          const on = actions.includes(c.id);
                          const verdict = reviewed ? (c.recommended === on ? "right" : "wrong") : undefined;
                          return (
                            <li key={c.id} data-state={verdict}>
                              <label className="wb-check">
                                <input
                                  type="checkbox"
                                  checked={on}
                                  disabled={reviewed}
                                  onChange={() =>
                                    setActions((a) => (on ? a.filter((x) => x !== c.id) : [...a, c.id]))
                                  }
                                />
                                <span>{c.label}</span>
                              </label>
                              {reviewed && (
                                <p className="wb-check__why">
                                  <span className="label">{c.recommended ? "Recommended" : "Not recommended"}</span>{" "}
                                  {c.reasoning}
                                </p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </fieldset>

                    <div className="wb-field">
                      <label className="label" htmlFor="wb-note">
                        Analyst note (optional, stays in your browser)
                      </label>
                      <textarea
                        id="wb-note"
                        className="wb-note"
                        rows={3}
                        value={note}
                        maxLength={600}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Anything the next shift should know"
                      />
                    </div>

                    <div className="wb-nav">
                      {!reviewed ? (
                        <button type="button" className="btn btn--primary" disabled={!dec} onClick={() => setReviewed(true)}>
                          Review my plan
                        </button>
                      ) : (
                        <>
                          <button type="button" className="btn btn--primary" onClick={() => go(4)}>
                            Write handoff <span aria-hidden="true">→</span>
                          </button>
                          <button type="button" className="btn" onClick={() => setReviewed(false)}>
                            Edit plan
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* ── 5. Handoff ───────────────────────── */}
                {step === 4 && (
                  <div className="wb-panel">
                    <h3 ref={headingRef} tabIndex={-1} className="wb-panel__title">
                      Shift handoff, generated from your decisions.
                    </h3>
                    <p className="wb-panel__hint">
                      Short, factual, and ready to paste into a ticket. The next analyst should be able to act on it
                      without asking a question.
                    </p>
                    <pre className="wb-handoff" tabIndex={0} aria-label="Shift handoff note">
                      {handoff}
                    </pre>
                    <div className="wb-nav">
                      <button type="button" className="btn btn--primary" onClick={copy}>
                        {copied ? "Copied" : "Copy note"}
                      </button>
                      <button type="button" className="btn" onClick={reset}>
                        Start over
                      </button>
                      <span className="sr-only" aria-live="polite">
                        {copied ? "Handoff note copied to clipboard" : ""}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Case sheet: live indicators */}
              <aside className="wb-case" aria-label="Case sheet">
                <p className="label">Case sheet</p>
                <dl>
                  <div>
                    <dt className="label">Alert</dt>
                    <dd className="mono">A-1042</dd>
                  </div>
                  <div>
                    <dt className="label">Account</dt>
                    <dd className="mono">r.castillo</dd>
                  </div>
                  <div>
                    <dt className="label">Evidence</dt>
                    <dd className="mono">
                      {checked ? `${timeline.filter((e) => sorted[e.id] === "evidence").length} marked` : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="label">Severity</dt>
                    <dd>{sev ? <span className={sevClass(sev)}>{sev}</span> : <span className="mono">—</span>}</dd>
                  </div>
                  <div>
                    <dt className="label">Confidence</dt>
                    <dd>
                      <span className="meter" aria-hidden="true">
                        {CONFIDENCES.map((c, i) => (
                          <span key={c} data-on={conf ? CONFIDENCES.indexOf(conf) >= i : false} />
                        ))}
                      </span>
                      <span className="mono">{conf ?? "—"}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="label">Decision</dt>
                    <dd className="mono">{decObj ? decObj.label : "—"}</dd>
                  </div>
                </dl>
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
