"use client";

import { useEffect, useRef, useState } from "react";
import { PRESETS, PRESET_INFO, type Preset } from "@/lib/presets";
import { SceneLayers } from "./scene/SceneLayers";
import { Icon } from "./Icon";

export function PresetPicker({ value, onChange }: { value: Preset; onChange: (p: Preset, origin: { x: number; y: number }) => void }) {
  const [open, setOpen] = useState(false);
  const [hl, setHl] = useState(PRESETS.indexOf(value));
  const root = useRef<HTMLDivElement>(null);
  const info = PRESET_INFO[value];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  const choose = (p: Preset, el?: Element | null) => {
    const r = el?.getBoundingClientRect();
    onChange(p, r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth / 2, y: 120 });
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") setHl((h) => (h + 1) % PRESETS.length);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") setHl((h) => (h - 1 + PRESETS.length) % PRESETS.length);
    else if (e.key === "Enter") choose(PRESETS[hl], root.current?.querySelectorAll(".pp-opt")[hl]);
    else if (e.key === "Escape") setOpen(false);
    else return;
    e.preventDefault();
  };

  return (
    <div className="pp" ref={root} onKeyDown={onKey}>
      <button
        type="button"
        className="pp-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setHl(PRESETS.indexOf(value));
          setOpen((o) => !o);
        }}
      >
        <span className="pp-dot" data-preset={value}>
          {info.emoji}
        </span>
        <span className="label-wide">Visual: </span>
        {info.label}
        <Icon name="chevron" size={14} />
      </button>
      {open && (
        <div className="pp-panel" role="listbox" aria-label="Visual da viagem">
          {PRESETS.map((p, i) => (
            <button
              key={p}
              type="button"
              role="option"
              aria-selected={p === value}
              data-preset={p}
              className={`pp-opt ${i === hl ? "hl" : ""}`}
              onMouseEnter={() => setHl(i)}
              onClick={(e) => choose(p, e.currentTarget)}
            >
              <span className="pp-scene">
                <SceneLayers preset={p} lite />
              </span>
              <b>{PRESET_INFO[p].label}</b>
              <small>{PRESET_INFO[p].tagline}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
