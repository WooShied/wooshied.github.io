import { useState } from "react";
import { profile } from "../content/profile";
import { SectionHeader } from "./SectionHeader";
import { ExternalLink } from "./ExternalLink";

/**
 * Toolbox & training: hands-on experience first, then every tool used,
 * then certifications as one card among several.
 */
export function Toolbox() {
  const { ojt, toolbox, certifications, caseStudies } = profile;
  const [group, setGroup] = useState<string | null>(null);
  const earned = certifications.filter((c) => c.status === "earned");
  const studying = certifications.filter((c) => c.status === "studying");
  const next = caseStudies.filter((c) => c.state === "template");
  const toolCount = toolbox.reduce((n, g) => n + g.items.length, 0);

  return (
    <section id="toolbox" className="section" aria-labelledby="toolbox-title">
      <div className="wrap">
        <SectionHeader
          index="05"
          id="toolbox"
          title={
            <>
              Toolbox <span className="spectrum-text">&amp; training</span>
            </>
          }
          kicker="Most of what I know I learned on the job: in a 24/7 operations center, in client security work, and shipping software."
        />

        <div className="bento bento--tools">
          <div className="card card--ojt" data-reveal>
            <p className="card__eyebrow">Learned on the job · {ojt.length} areas</p>
            <ol className="ojt">
              {ojt.map((o, i) => (
                <li key={o.title} style={{ ["--c" as string]: profile.layers[i % profile.layers.length].color }}>
                  <span className="ojt__num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="ojt__title">{o.title}</p>
                    <p className="ojt__detail">{o.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="card card--wall" data-reveal>
            <div className="wall__head">
              <p className="card__eyebrow">Toolbox · {toolCount} tools</p>
              <div className="wall__filters" role="group" aria-label="Filter tools">
                <button type="button" className="chip" aria-pressed={group === null} onClick={() => setGroup(null)}>
                  All
                </button>
                {toolbox.map((g) => (
                  <button
                    key={g.title}
                    type="button"
                    className="chip"
                    aria-pressed={group === g.title}
                    style={{ ["--c" as string]: g.color }}
                    onClick={() => setGroup(group === g.title ? null : g.title)}
                  >
                    {g.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="wall">
              {toolbox.map((g) => (
                <div key={g.title} className="wall__group" data-dim={group && group !== g.title ? "true" : undefined}>
                  <p className="wall__title" style={{ color: g.color }}>
                    {g.title}
                  </p>
                  <ul>
                    {g.items.map((t) => (
                      <li key={t} className="tool" style={{ ["--c" as string]: g.color }}>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="card card--cert" data-reveal>
            <p className="card__eyebrow">Certifications</p>
            {earned.map((c) => (
              <div key={c.name} className="cert">
                <span className="cert__seal" aria-hidden="true">
                  ✓
                </span>
                <div>
                  <p className="cert__name">{c.name}</p>
                  <p className="cert__meta">
                    Earned{c.date ? ` · ${c.date}` : ""}
                  </p>
                </div>
              </div>
            ))}
            <p className="cert__sub">Currently studying</p>
            <ul className="study">
              {studying.map((c) => (
                <li key={c.name}>
                  <span className="study__name">{c.name}</span>
                  <span className="study__issuer">{c.issuer}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card card--lab" data-reveal>
            <p className="card__eyebrow">Lab notebook</p>
            {profile.showPlaceholders && next.length ? (
              <>
                <p className="card__body">Next on the bench: home-lab investigations I&rsquo;m writing up.</p>
                <ul className="lab-next">
                  {next.map((c) => (
                    <li key={c.id}>
                      <span>{c.focus}</span>
                      {c.title}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <ExternalLink className="linkrow" href={profile.identity.links.github.href}>
              Code on GitHub <span aria-hidden="true">↗</span>
            </ExternalLink>
          </div>
        </div>
      </div>
    </section>
  );
}
