import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** Matches --live in tokens.css (canvas can't read CSS variables). */
const SIGNAL = "#5eea8f";

/**
 * The name, with a scanner lens. Under the lens the letters switch to an
 * outlined version in the green "live" signal, and nearby grid dots
 * light up like an active scan. Follows the pointer; drifts on its own when idle (touch, keyboard).
 * Decorative: the real heading text is always present and readable.
 */
export function Scanner({ name }: { name: string }) {
  const stackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ");
  const layerColors = [SIGNAL];

  useEffect(() => {
    const stack = stackRef.current;
    const canvas = canvasRef.current;
    if (!stack || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let lastPointer = -1e9;
    const pos = { x: 0, y: 0, tx: 0, ty: 0 };
    const start = performance.now();

    const resize = () => {
      const r = stack.getBoundingClientRect();
      w = r.width;
      h = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!pos.x) {
        pos.x = pos.tx = w * 0.62;
        pos.y = pos.ty = h * 0.55;
      }
    };

    const radius = () => Math.max(56, Math.min(w, h) * 0.24);

    const draw = () => {
      stack.style.setProperty("--x", `${pos.x}px`);
      stack.style.setProperty("--y", `${pos.y}px`);
      stack.style.setProperty("--r", `${radius()}px`);
      ctx.clearRect(0, 0, w, h);
      const gap = 22;
      const R = radius() * 1.6;
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          const d = Math.hypot(x - pos.x, y - pos.y);
          const k = Math.max(0, 1 - d / R);
          if (k > 0) {
            ctx.globalAlpha = 0.12 + k * 0.5;
            ctx.fillStyle = SIGNAL;
            const s = 1.2 + k * 1.8;
            ctx.fillRect(x - s / 2, y - s / 2, s, s);
          } else {
            ctx.globalAlpha = 0.12;
            ctx.fillStyle = "#f5f5f5";
            ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      raf = 0;
      // Idle drift: a slow figure-eight across the name.
      if (now - lastPointer > 2500) {
        const t = (now - start) / 1000;
        pos.tx = w * (0.5 + 0.36 * Math.sin(t * 0.45));
        pos.ty = h * (0.5 + 0.22 * Math.sin(t * 0.9));
      }
      pos.x += (pos.tx - pos.x) * 0.12;
      pos.y += (pos.ty - pos.y) * 0.12;
      draw();
      if (visible) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = stack.getBoundingClientRect();
      pos.tx = e.clientX - r.left;
      pos.ty = e.clientY - r.top;
      lastPointer = performance.now();
    };

    resize();
    draw();
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(stack);

    if (reduced) return () => ro.disconnect();

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(stack);
    stack.addEventListener("pointermove", onMove);
    stack.addEventListener("pointerdown", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      stack.removeEventListener("pointermove", onMove);
      stack.removeEventListener("pointerdown", onMove);
    };
  }, [reduced]);

  return (
    <div className="scan" ref={stackRef}>
      <canvas ref={canvasRef} className="scan__grid" aria-hidden="true" />
      <h1 className="scan__name">
        <span>{first}</span>
        <span>{last}</span>
      </h1>
      <div className="scan__name scan__name--x" aria-hidden="true">
        {[first, last].map((word, wi) => (
          <span key={wi}>
            {[...word].map((ch, i) => (
              <b key={i} style={{ ["--c" as string]: layerColors[(i + wi * 2) % layerColors.length] }}>
                {ch}
              </b>
            ))}
          </span>
        ))}
      </div>
      <div className="scan__lens" aria-hidden="true">
        <span className="scan__tick scan__tick--n" />
        <span className="scan__tick scan__tick--e" />
        <span className="scan__tick scan__tick--s" />
        <span className="scan__tick scan__tick--w" />
        <span className="scan__label">scan</span>
      </div>
    </div>
  );
}
