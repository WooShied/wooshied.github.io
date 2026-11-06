import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NAV } from "./navItems";

/**
 * Top bar: a terminal-style path that tracks the current section,
 * numbered links with a sliding indicator, and a scroll progress line.
 */
export function Nav() {
  const [current, setCurrent] = useState<string>("");
  const [open, setOpen] = useState(false);
  const linksRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);

  // Which section is in the middle of the viewport.
  useEffect(() => {
    const els = ["top", ...NAV.map((n) => n.id)].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setCurrent(e.target.id === "top" ? "" : e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Scroll progress, written straight to a CSS variable (no re-render).
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      barRef.current?.style.setProperty("--progress", String(max > 0 ? window.scrollY / max : 0));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Slide the indicator under the active link.
  useLayoutEffect(() => {
    const ul = linksRef.current;
    if (!ul) return;
    const measure = () => {
      const a = ul.querySelector<HTMLAnchorElement>('a[aria-current="true"]');
      if (!a) return setIndicator(null);
      setIndicator({ x: a.offsetLeft, w: a.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [current]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const path = current ? `~/${current}` : "~";

  return (
    <header className="bar" ref={barRef}>
      <div className="bar__progress" aria-hidden="true" />
      <div className="bar__inner">
        <a href="#top" className="bar__prompt" aria-label="Aadil Rashid, back to top">
          <span className="bar__user">aadil</span>
          <span className="bar__at">@</span>
          <span className="bar__host">clearance</span>
          <span className="bar__colon">:</span>
          <span className="bar__path">{path}</span>
          <span className="bar__caret" aria-hidden="true" />
        </a>

        <nav aria-label="Sections" className="bar__nav">
          <ul ref={linksRef}>
            {NAV.map((n, i) => (
              <li key={n.id}>
                <a href={`#${n.id}`} aria-current={current === n.id ? "true" : undefined}>
                  <span className="bar__num">0{i + 1}</span>
                  {n.label}
                </a>
              </li>
            ))}
            {indicator ? (
              <li
                className="bar__indicator"
                aria-hidden="true"
                style={{ transform: `translateX(${indicator.x}px)`, width: indicator.w }}
              />
            ) : null}
          </ul>
        </nav>

        <button
          ref={menuBtn}
          type="button"
          className="bar__menu"
          aria-expanded={open}
          aria-controls="menu-sheet"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <nav id="menu-sheet" className="sheet" aria-label="Sections" hidden={!open}>
        <ul>
          {NAV.map((n, i) => (
            <li key={n.id}>
              <a href={`#${n.id}`} onClick={() => setOpen(false)}>
                <span className="bar__num">0{i + 1}</span>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
