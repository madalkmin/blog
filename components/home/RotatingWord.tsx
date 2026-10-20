"use client";

import { useEffect, useState } from "react";
import type { Preset } from "@/lib/presets";

const WORDS: { word: string; preset: Preset }[] = [
  { word: "florestas", preset: "floresta" },
  { word: "montanhas", preset: "montanha" },
  { word: "praias", preset: "praia" },
  { word: "desertos", preset: "deserto" },
  { word: "cidades", preset: "cidade" },
];

// Cada palavra aparece com a fonte e a cor do seu preset
export function RotatingWord() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="rotator" aria-label={WORDS.map((w) => w.word).join(", ")}>
      {WORDS.map((w, n) => (
        <span key={w.word} data-preset={w.preset} aria-hidden className={n === i ? "on" : n === (i - 1 + WORDS.length) % WORDS.length ? "off" : ""}>
          {w.word}
        </span>
      ))}
    </span>
  );
}
