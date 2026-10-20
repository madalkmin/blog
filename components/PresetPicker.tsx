"use client";

import { useEffect, useRef, useState } from "react";
import { PRESETS, PRESET_INFO, type Preset } from "@/lib/presets";
import { Icon } from "./Icon";

// Escolha do visual: cada opção mostra a fonte de título e a cor de detalhe do preset
export function PresetPicker({ value, onChange }: { value: Preset; onChange: (p: Preset) => void }) {
  const [open, setOpen] = useState(false);
  const [hl, setHl] = useState(PRESETS.indexOf(value));
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  const choose = (p: Preset) => {
    onChange(p);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") setHl((h) => (h + 1) % PRESETS.length);
    else if (e.key === "ArrowUp") setHl((h) => (h - 1 + PRESETS.length) % PRESETS.length);
    else if (e.key === "Enter") choose(PRESETS[hl]);
    else if (e.key === "Escape") setOpen(false);
    else return;
    e.preventDefault();
  };

  return (
    <div className={`pp ${open ? "open" : ""}`} ref={root} onKeyDown={onKey}>
      <button
        type="button"
        className="pp-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Visual da viagem: ${PRESET_INFO[value].label}`}
        onClick={() => {
          setHl(PRESETS.indexOf(value));
          setOpen((o) => !o);
        }}
      >
        <span className="pp-aa">Aa</span>
        {PRESET_INFO[value].label}
        <span className="sel-chev">
          <Icon name="chevron" size={14} />
        </span>
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
              onClick={() => choose(p)}
            >
              <span className="pp-aa">Aa</span>
              <b>{PRESET_INFO[p].label}</b>
              <small>{PRESET_INFO[p].tagline}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
