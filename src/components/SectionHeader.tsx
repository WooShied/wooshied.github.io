import type { ReactNode } from "react";

interface Props {
  index: string;
  id: string;
  title: ReactNode;
  kicker?: ReactNode;
  aside?: ReactNode;
}

/** Numbered section heading: outlined number, wide display title, short lede. */
export function SectionHeader({ index, id, title, kicker, aside }: Props) {
  return (
    <header className="shead" data-reveal>
      <span className="shead__num" aria-hidden="true">
        {index}
      </span>
      <div className="shead__main">
        <h2 id={`${id}-title`} className="shead__title">
          {title}
        </h2>
        {kicker ? <p className="shead__kicker">{kicker}</p> : null}
      </div>
      {aside ? <div className="shead__aside">{aside}</div> : null}
    </header>
  );
}
