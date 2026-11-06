import { useEffect, useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { ExternalLink } from "./ExternalLink";
import { useInView } from "../hooks/useInView";
import { FEED_REPO, ago, loadFeed, nvdUrl, pct, shortDate, type Feed, type FeedVuln } from "../feed";

type State = { status: "idle" | "loading" } | { status: "ready"; feed: Feed } | { status: "error" };

const STALE_HOURS = 72;

/** Risk tone for an EPSS score: drives the meter color. */
const tone = (x: number | null) => (x === null ? "low" : x >= 0.9 ? "high" : x >= 0.5 ? "mid" : "low");

/**
 * Live threat intel: the summary my threat-feed tool publishes every morning.
 * Loaded in the visitor's browser when the section scrolls near, so the site
 * never needs a rebuild to stay current.
 */
export function ThreatFeed() {
  const { ref, inView } = useInView<HTMLElement>("600px 0px 600px 0px");
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    if (!inView || state.status !== "idle") return;
    setState({ status: "loading" });
    loadFeed().then(
      (feed) => setState({ status: "ready", feed }),
      () => setState({ status: "error" }),
    );
  }, [inView, state.status]);

  return (
    <section ref={ref} id="intel" className="section" aria-labelledby="intel-title" aria-busy={state.status === "loading"}>
      <div className="wrap">
        <SectionHeader
          index="04"
          id="intel"
          title={
            <>
              Live <span className="spectrum-text">threat intel</span>
            </>
          }
          kicker="Every morning a tool I built pulls CISA's catalog of vulnerabilities under active attack, scores each one for exploit likelihood with EPSS, and publishes a digest. This is what I read first."
          aside={
            <ExternalLink className="pill" href={FEED_REPO}>
              threat-feed on GitHub <span aria-hidden="true">↗</span>
            </ExternalLink>
          }
        />
        <div data-reveal>
          {state.status === "ready" ? (
            <FeedGrid feed={state.feed} />
          ) : state.status === "error" ? (
            <div className="card intel-error" role="status">
              <p className="card__eyebrow">Feed offline</p>
              <p className="card__body">The live digest couldn&rsquo;t be loaded right now. The full history is on GitHub.</p>
              <ExternalLink className="linkrow" href={FEED_REPO}>
                Open threat-feed <span aria-hidden="true">↗</span>
              </ExternalLink>
            </div>
          ) : (
            <Skeleton />
          )}
        </div>
      </div>
    </section>
  );
}

function Skeleton() {
  return (
    <div className="bento bento--intel" aria-hidden="true">
      {["pulse", "chart", "latest", "top", "watch", "notes"].map((a) => (
        <div key={a} className={`card intel-skel card--i-${a}`} />
      ))}
      <span className="sr-only" role="status">
        Loading the live threat digest…
      </span>
    </div>
  );
}

function FeedGrid({ feed }: { feed: Feed }) {
  const hours = (Date.now() - feed.generated.getTime()) / 3_600_000;
  const stale = hours > STALE_HOURS;
  const added30 = feed.history.reduce((n, h) => n + h.count, 0);
  const watch = feed.movers.length ? "movers" : "due";

  return (
    <div className="bento bento--intel">
      <div className="card card--i-pulse">
        <p className="card__eyebrow">
          <span className={`intel-dot${stale ? " is-stale" : ""}`} aria-hidden="true" />
          {stale ? "Last digest" : "Live"} · {shortDate(feed.date)}
        </p>
        <dl className="intel-stats">
          <div>
            <dt>Under active attack</dt>
            <dd>{feed.total.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Used by ransomware</dt>
            <dd className="is-rose">{feed.ransomware.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Added, last 30 days</dt>
            <dd className="is-cyan">{added30}</dd>
          </div>
        </dl>
        <p className="card__hint">
          Updated {ago(feed.generated)}
          {feed.epssOk ? "" : " · EPSS not refreshed"}
        </p>
      </div>

      <div className="card card--i-chart">
        <p className="card__eyebrow">Added to CISA KEV · last 30 days</p>
        <History history={feed.history} />
      </div>

      <div className="card card--i-latest">
        <p className="card__eyebrow">{feed.isNew ? `New today · ${feed.latest.length}` : "Most recent additions"}</p>
        <VulnList rows={feed.latest} meta={(v) => `added ${shortDate(v.added)}`} />
      </div>

      <div className="card card--i-top">
        <p className="card__eyebrow">Most likely to be exploited</p>
        <VulnList rows={feed.top} meter />
      </div>

      <div className="card card--i-watch">
        <p className="card__eyebrow">{watch === "movers" ? "Biggest risk jumps overnight" : "Federal patch deadlines this week"}</p>
        {watch === "movers" ? (
          <VulnList rows={feed.movers} meta={(v) => `${(v.delta ?? 0) >= 0 ? "+" : ""}${((v.delta ?? 0) * 100).toFixed(1)} pts`} />
        ) : feed.due.length ? (
          <VulnList rows={feed.due} meta={(v) => `due ${shortDate(v.due)}`} />
        ) : (
          <p className="card__body">Nothing due in the next seven days.</p>
        )}
      </div>

      <div className="card card--i-notes">
        <p className="card__eyebrow">Analyst notes</p>
        {feed.notes.length ? (
          <ul className="intel-notes">
            {feed.notes.map((n, i) => (
              <li key={i}>
                <time dateTime={n.date}>{shortDate(n.date)}</time>
                <p>{n.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card__body">My takes on what stands out land here as I log them.</p>
        )}
        <ExternalLink className="linkrow" href={feed.digestUrl}>
          Read the full digest <span aria-hidden="true">↗</span>
        </ExternalLink>
      </div>
    </div>
  );
}

function VulnList({ rows, meter, meta }: { rows: FeedVuln[]; meter?: boolean; meta?: (v: FeedVuln) => string }) {
  if (!rows.length) return <p className="card__body">Nothing to show today.</p>;
  return (
    <ol className="vulns">
      {rows.map((v) => (
        <li key={v.cve} className="vuln" data-tone={tone(v.epss)}>
          <div className="vuln__head">
            <ExternalLink className="vuln__cve" href={nvdUrl(v.cve)}>
              {v.cve}
            </ExternalLink>
            {v.ransomware ? <span className="vuln__tag">ransomware</span> : null}
            <span className="vuln__score" title="EPSS: estimated chance of exploitation in the next 30 days">
              {pct(v.epss)}
            </span>
          </div>
          <p className="vuln__what">
            <strong>
              {v.vendor} {v.product}
            </strong>
            {meta ? <span className="vuln__meta"> · {meta(v)}</span> : null}
          </p>
          {meter ? (
            <span className="vuln__meter" aria-hidden="true">
              <i style={{ width: `${Math.max(2, (v.epss ?? 0) * 100)}%` }} />
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function History({ history }: { history: Feed["history"] }) {
  const max = Math.max(1, ...history.map((h) => h.count));
  const total = history.reduce((n, h) => n + h.count, 0);
  const peak = history.reduce((a, h) => (h.count > a.count ? h : a), history[0] ?? { date: "", count: 0 });
  const W = 300;
  const H = 96;
  const bw = W / Math.max(1, history.length);
  const label = history.length
    ? `${total} vulnerabilities added in the last 30 days${peak.count ? `, most on ${shortDate(peak.date)} (${peak.count})` : ""}.`
    : "No history yet.";

  return (
    <figure className="intel-chart">
      <svg viewBox={`0 0 ${W} ${H + 14}`} role="img" aria-label={label} preserveAspectRatio="none">
        {[0.5, 1].map((f) => (
          <line key={f} x1="0" x2={W} y1={H - H * f} y2={H - H * f} className="intel-chart__grid" />
        ))}
        {history.map((h, i) => {
          const bh = h.count ? Math.max(3, (h.count / max) * (H - 6)) : 1.5;
          return (
            <rect
              key={h.date}
              x={i * bw + 1.5}
              y={H - bh}
              width={Math.max(1, bw - 3)}
              height={bh}
              rx="1.5"
              className={h.count ? "intel-chart__bar" : "intel-chart__zero"}
              style={{ ["--i" as string]: i }}
            >
              <title>
                {shortDate(h.date)}: {h.count} added
              </title>
            </rect>
          );
        })}
        <line x1="0" x2={W} y1={H} y2={H} className="intel-chart__axis" />
      </svg>
      <figcaption>
        <span>{history[0] ? shortDate(history[0].date) : ""}</span>
        <span>
          peak {peak.count} · {total} total
        </span>
        <span>{history.length ? shortDate(history[history.length - 1].date) : ""}</span>
      </figcaption>
    </figure>
  );
}
