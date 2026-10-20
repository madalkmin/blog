"use client";

import { useEffect, useRef } from "react";
import type { Preset } from "@/lib/presets";
import { ParticleCanvas } from "./ParticleCanvas";
import { SceneLayers } from "./SceneLayers";

// Fundo animado fixo de um preset: paisagem em camadas com parallax + partículas
export function Scene({ preset, bursts = true }: { preset: Preset; bursts?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const m = { x: 0, y: 0 };
    let raf = 0;
    const update = () => {
      raf = 0;
      el.style.setProperty("--sy", String(Math.min(window.scrollY, 4000)));
      el.style.setProperty("--mx", m.x.toFixed(3));
      el.style.setProperty("--my", m.y.toFixed(3));
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onMove = (e: PointerEvent) => {
      m.x = (e.clientX / window.innerWidth) * 2 - 1;
      m.y = (e.clientY / window.innerHeight) * 2 - 1;
      request();
    };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={ref} className="scene" data-scene={preset} aria-hidden>
      <SceneLayers preset={preset} />
      <ParticleCanvas preset={preset} bursts={bursts} />
      <div className="scene-veil" />
    </div>
  );
}
