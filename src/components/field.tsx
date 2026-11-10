import { useEffect, useRef } from "react";

type Mote = { x: number; y: number; r: number; v: number; a: number; tint: number };

export function Field() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || "#d6e27a";
    const paper = getComputedStyle(document.documentElement).getPropertyValue("--color-fg").trim() || "#ebe6da";
    let frame = 0;
    let motes: Mote[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(64, Math.floor(window.innerWidth / 18));
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.4,
        v: Math.random() * 0.18 + 0.04,
        a: Math.random() * 0.28 + 0.05,
        tint: Math.random(),
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const mote of motes) {
        if (!reduce) {
          mote.y -= mote.v;
          mote.x += Math.sin(mote.y * 0.01 + mote.tint * 6) * 0.08;
          if (mote.y < -4) {
            mote.y = window.innerHeight + 4;
            mote.x = Math.random() * window.innerWidth;
          }
        }
        context.beginPath();
        context.fillStyle = mote.tint > 0.75 ? accent : paper;
        context.globalAlpha = mote.a;
        context.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      if (!reduce) frame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10 h-full w-full" aria-hidden />;
}
