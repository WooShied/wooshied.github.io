import { profile } from "../content/profile";
import { ExternalLink } from "./ExternalLink";

export function Contact() {
  const { identity, layers } = profile;
  const showEmail = identity.email.approved && identity.email.address;
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="wrap">
        <div className="contact__card" data-reveal>
          <div className="contact__spectrum" aria-hidden="true">
            {layers.map((l) => (
              <i key={l.id} style={{ background: l.color }} />
            ))}
          </div>
          <p className="card__eyebrow">05 · Say hello</p>
          <h2 id="contact-title" className="contact__title">
            Let&rsquo;s talk <span className="spectrum-text">security.</span>
          </h2>
          <p className="contact__lede">
            A threat you&rsquo;re tracking, a tool worth trying, an incident you learned from. I&rsquo;m always up for
            the conversation.
          </p>
          <div className="contact__links">
            <ExternalLink className="pill pill--solid pill--lg" href={identity.links.linkedin.href}>
              LinkedIn <span aria-hidden="true">↗</span>
            </ExternalLink>
            <ExternalLink className="pill pill--lg" href={identity.links.github.href}>
              GitHub <span aria-hidden="true">↗</span>
            </ExternalLink>
            {showEmail ? (
              <a className="pill pill--lg" href={`mailto:${identity.email.address}`}>
                Email
              </a>
            ) : null}
            {identity.resumeUrl ? (
              <a className="pill pill--lg" href={identity.resumeUrl}>
                Résumé
              </a>
            ) : null}
          </div>
          <p className="contact__where">{identity.location}</p>
        </div>
      </div>
    </section>
  );
}
