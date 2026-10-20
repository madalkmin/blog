"use client";

import { useEffect, useRef } from "react";
import type { Preset } from "@/lib/presets";
import { SYSTEMS, type P } from "./particles";

const EDITABLE = "input, textarea, select, [contenteditable='true'], .sel, .no-burst";

export function ParticleCanvas({ preset, bursts = true }: { preset: Preset; bursts?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const sys = SYSTEMS[preset];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let target = 0;
    let parts: P[] = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      target = Math.round(sys.ambient * Math.min(1.4, Math.max(0.35, (w * h) / (1440 * 900))));
    };
    resize();
    parts = Array.from({ length: target }, () => sys.spawn(w, h, true));

    const frame = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const ambient = parts.reduce((n, p) => n + (p.burst ? 0 : 1), 0);
      for (let i = ambient; i < target; i++) if (Math.random() < 0.25) parts.push(sys.spawn(w, h, false));

      parts = parts.filter((p) => {
        p.life++;
        if (!p.burst) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120 && d2 > 1) {
            const f = (1 - Math.sqrt(d2) / 120) * 1.6;
            p.x += (dx / Math.sqrt(d2)) * f;
            p.y += (dy / Math.sqrt(d2)) * f;
          }
        }
        sys.step(p, t, w, h);
        if (p.life >= p.max) return false;
        ctx.save();
        sys.draw(ctx, p, t);
        ctx.restore();
        return true;
      });
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    const onDown = (e: PointerEvent) => {
      if (!bursts || (e.target as Element)?.closest?.(EDITABLE)) return;
      parts.push(...sys.burst(e.clientX, e.clientY));
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(frame);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("visibilitychange", onVis);
    if (reduce) {
      parts.forEach((p) => {
        ctx.save();
        sys.draw(ctx, p, 0);
        ctx.restore();
      });
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [preset, bursts]);

  return <canvas ref={ref} className="scene-canvas" aria-hidden />;
}
