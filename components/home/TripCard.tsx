"use client";

import Link from "next/link";
import { useRef } from "react";
import { PRESET_INFO } from "@/lib/presets";
import { formatMonth } from "@/lib/format";
import type { Trip } from "@/lib/types";
import { SceneLayers } from "../scene/SceneLayers";
import { Icon } from "../Icon";

export function TripCard({ trip, index }: { trip: Trip; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const info = PRESET_INFO[trip.preset];

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
    el.style.setProperty("--px", `${x * 100}%`);
    el.style.setProperty("--py", `${y * 100}%`);
  };

  const onLeave = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="reveal" style={{ transitionDelay: `${(index % 3) * 90}ms` }}>
    <Link
      ref={ref}
      href={`/viagem/${trip.slug}`}
      className="card"
      data-preset={trip.preset}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <span className="card-scene">
        <SceneLayers preset={trip.preset} lite />
      </span>
      {trip.cover_url && <img className="card-cover" src={trip.cover_url} alt="" loading="lazy" />}
      <span className="card-shine" />
      <span className="card-arrow">
        <Icon name="arrowUpRight" />
      </span>
      <div className="card-body">
        <div className="card-tags">
          <span className="card-tag">
            {info.emoji} {info.label}
          </span>
          {!trip.published && <span className="card-tag card-tag--draft">Rascunho</span>}
        </div>
        <h3 className="card-title">{trip.title || "Sem título"}</h3>
        <p className="card-meta">{[trip.location, formatMonth(trip.start_date)].filter(Boolean).join(" · ") || " "}</p>
      </div>
    </Link>
    </div>
  );
}
