import Link from "next/link";
import { PRESET_INFO } from "@/lib/presets";
import type { Trip } from "@/lib/types";

export function TripCard({ trip, index }: { trip: Trip; index: number }) {
  const info = PRESET_INFO[trip.preset];
  return (
    <Link
      href={`/viagem/${trip.slug}`}
      className="card reveal"
      data-preset={trip.preset}
      style={{ transitionDelay: `${(index % 3) * 80}ms` }}
    >
      <div className="card-ph">
        <div className="card-img">
          {trip.cover_url ? (
            <img src={trip.cover_url} alt="" loading="lazy" />
          ) : (
            <div className="card-blank" aria-hidden>
              Aa
            </div>
          )}
        </div>
        <div className="card-cap">
          <span>{info.label}</span>
          {trip.published ? <span>{trip.start_date?.slice(0, 4) ?? ""}</span> : <span className="draft">Rascunho</span>}
        </div>
      </div>
      <h3 className="card-title">{trip.title || "Sem título"}</h3>
      {trip.location && <p className="card-meta">{trip.location}</p>}
    </Link>
  );
}
