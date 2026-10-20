"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";

export type Option<T extends string> = { value: T; label: string };

// Select acessível com visual do preset atual (o <select> nativo não aceita esse nível de estilo)
export function Select<T extends string>({
  value,
  options,
  onChange,
  label,
  className = "",
}: {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [hl, setHl] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  const show = () => {
    setHl(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const choose = (i: number) => {
    onChange(options[i].value);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        show();
      }
      return;
    }
    if (e.key === "ArrowDown") setHl((h) => (h + 1) % options.length);
    else if (e.key === "ArrowUp") setHl((h) => (h - 1 + options.length) % options.length);
    else if (e.key === "Enter" || e.key === " ") choose(hl);
    else if (e.key === "Escape") setOpen(false);
    else return;
    e.preventDefault();
  };

  return (
    <div ref={root} className={`sel ${open ? "open" : ""} ${className}`} onKeyDown={onKey}>
      <button
        type="button"
        className="sel-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${current.label}`}
        aria-controls={id}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => (open ? setOpen(false) : show())}
      >
        <span>{current.label}</span>
        <span className="sel-chev">
          <Icon name="chevron" size={14} />
        </span>
      </button>
      {open && (
        <ul className="sel-list" role="listbox" id={id} aria-label={label}>
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`sel-opt ${i === hl ? "hl" : ""}`}
              onMouseEnter={() => setHl(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(i)}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
