import { useEffect } from "react";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Timeline } from "./components/Timeline";
import { SkillTrace } from "./components/SkillTrace";
import { Playground } from "./components/playground/Playground";
import { Toolbox } from "./components/Toolbox";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

/** Fade/slide elements marked data-reveal into view once. CSS skips this under reduced motion. */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** Cursor spotlight on cards: writes the pointer position into CSS variables. */
function useSpotlight() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement | null)?.closest?.(".card") as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
}

export default function App() {
  useReveal();
  useSpotlight();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Timeline />
        <SkillTrace />
        <Playground />
        <Toolbox />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
