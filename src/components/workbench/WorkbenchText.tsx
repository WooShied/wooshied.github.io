import {
  containment,
  decisions,
  hypotheses,
  openQuestions,
  queue,
  reference,
  timeline,
} from "../../content/workbench";

const CLASS_LABEL = { evidence: "Evidence", baseline: "Baseline", noise: "Noise" } as const;

/** Same scenario as the interactive workbench, as a static case file. */
export function WorkbenchText() {
  const decision = decisions.find((d) => d.correct)!;
  return (
    <article className="casefile" aria-label="SOC workbench case file">
      <section>
        <h3 className="casefile__h">1 · Triage the queue</h3>
        <p>Four alerts are waiting. Work the one with the highest risk of active harm first.</p>
        <ul className="casefile__list">
          {queue.map((a) => (
            <li key={a.id}>
              <strong>
                {a.id} · {a.severity} · {a.title}
              </strong>{" "}
              <span className="mono">({a.entity})</span>
              <br />
              {a.isPrimary ? a.triageNote : a.disposition}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="casefile__h">2 · Timeline for A-1042</h3>
        <p>Times are Pacific. Each event is labeled as evidence, baseline (what normal looks like), or noise.</p>
        <ol className="casefile__list">
          {timeline.map((e) => (
            <li key={e.id}>
              <span className="mono">{e.time}</span> · <strong>{e.summary}</strong>
              <br />
              <span className="mono casefile__detail">{e.detail}</span>
              <br />
              <span className="label">{CLASS_LABEL[e.answer]}</span> {e.reasoning}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="casefile__h">3 · Assessment</h3>
        <ul className="casefile__list">
          {hypotheses.map((h) => (
            <li key={h.id}>
              <strong>
                {h.correct ? "Accepted" : "Rejected"}: {h.label}.
              </strong>{" "}
              {h.feedback}
            </li>
          ))}
        </ul>
        <p>
          <strong>Severity {reference.severity}.</strong> {reference.severityRationale[reference.severity]}
        </p>
        <p>
          <strong>Confidence {reference.confidence}.</strong> {reference.confidenceRationale[reference.confidence]}
        </p>
      </section>

      <section>
        <h3 className="casefile__h">4 · Decision and containment</h3>
        <p>
          <strong>{decision.label}.</strong> {decision.feedback}
        </p>
        <ul className="casefile__list">
          {containment.map((c) => (
            <li key={c.id}>
              <strong>
                {c.recommended ? "Do" : "Don't"}: {c.label}.
              </strong>{" "}
              {c.reasoning}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="casefile__h">5 · Handoff</h3>
        <p>
          Escalated to incident response at High severity and High confidence: likely takeover of r.castillo through MFA
          fatigue, with an inbox rule and mailbox search aimed at payments. Sessions revoked, password reset with MFA
          re-registration, rule preserved then removed, source IP blocked, user contacted by phone.
        </p>
        <p>Open questions for IR:</p>
        <ul className="casefile__list">
          {openQuestions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
