import { useEffect, useState } from "react";
import { profile } from "../content/profile";
import type { Stat } from "../content/types";
import { Scanner } from "./Scanner";
import { ExternalLink } from "./ExternalLink";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

function CountUp({ stat }: { stat: Stat }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const reduced = useReducedMotion();
  const target = stat.value ?? 0;
  const [n, setN] = useState(reduced ? target : 0);

  useEffect(() => {
    if (stat.value === null || !inView || reduced) {
      setN(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 1200);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, stat.value, target]);

  return (
    <span ref={ref} className="stat__value">
      {stat.value === null ? stat.word : `${stat.prefix ?? ""}${n}${stat.suffix ?? ""}`}
    </span>
  );
}

export function Hero() {
  const { identity, hero, layers, about } = profile;
  return (
    <section id="top" className="hero" aria-labelledby="hero-name">
      <div className="wrap bento">
        <div className="card card--name">
          <p className="card__eyebrow">
            <span className="spectrum-dots" aria-hidden="true">
              {layers.map((l) => (
                <i key={l.id} style={{ background: l.color }} />
              ))}
            </span>
            Security · {identity.location}
          </p>
          <div id="hero-name">
            <Scanner name={identity.name} />
          </div>
          <p className="card__hint" aria-hidden="true">
            Move your cursor over the name
          </p>
        </div>

        {identity.photo.src ? (
          <figure className="card card--photo">
            <img src={identity.photo.src} alt={identity.photo.alt} width={480} height={600} />
            <figcaption>
              <span className="live" aria-hidden="true" />
              {identity.location}
            </figcaption>
          </figure>
        ) : null}

        <div className="card card--statement">
          <p className="statement">
            {hero.statement[0]} <span className="spectrum-text">{hero.statement[1]}</span>
          </p>
          <p className="card__body">{hero.sub}</p>
        </div>

        <div className="card card--now">
          <p className="card__eyebrow">
            <span className="live" aria-hidden="true" />
            Now
          </p>
          <p className="now__title">{hero.now.title}</p>
          <p className="now__org">{hero.now.org}</p>
          <p className="card__body">{hero.now.detail}</p>
        </div>

        <div className="card card--about">
          <p className="card__eyebrow">About</p>
          {about.map((p) => (
            <p key={p} className="about__p">
              {p}
            </p>
          ))}
        </div>

        <ul className="stats" aria-label="Highlights">
          {hero.stats.map((s, i) => (
            <li key={s.label} className="card stat" style={{ ["--c" as string]: layers[i % layers.length].color }}>
              <CountUp stat={s} />
              <span className="stat__label">{s.label}</span>
            </li>
          ))}
        </ul>

        <div className="card card--links">
          <p className="card__eyebrow">Elsewhere</p>
          <ExternalLink className="linkrow" href={identity.links.linkedin.href}>
            LinkedIn <span aria-hidden="true">↗</span>
          </ExternalLink>
          <ExternalLink className="linkrow" href={identity.links.github.href}>
            GitHub <span aria-hidden="true">↗</span>
          </ExternalLink>
          <a className="linkrow" href="#playground">
            Playground <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
