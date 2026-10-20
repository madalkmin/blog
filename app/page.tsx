import Link from "next/link";
import { getViewer } from "@/lib/supabase/server";
import { tripDays } from "@/lib/format";
import type { Trip } from "@/lib/types";
import { TripCard } from "@/components/home/TripCard";
import { RotatingWord } from "@/components/home/RotatingWord";
import { LogoutButton, NewTripButton } from "@/components/home/AdminActions";
import { ReadingFx } from "@/components/ReadingFx";

export const dynamic = "force-dynamic";

function Split({ text, delay = 0 }: { text: string; delay?: number }) {
  return text.split(" ").map((w, i) => (
    <span className="split-word" key={i}>
      <span style={{ animationDelay: `${delay + i * 0.08}s` }}>{w}</span>
      {" "}
    </span>
  ));
}

export default async function Home() {
  const { supabase, user, isAdmin } = await getViewer();
  const { data } = await supabase
    .from("trips")
    .select("*")
    .order("start_date", { ascending: false, nullsFirst: true })
    .order("created_at", { ascending: false });
  const trips = (data ?? []) as Trip[];
  const published = trips.filter((t) => t.published);
  const days = published.reduce((n, t) => n + (tripDays(t.start_date, t.end_date) ?? 0), 0);
  const places = new Set(published.map((t) => t.location.trim()).filter(Boolean)).size;

  return (
    <div className="home">
      <div className="aurora" aria-hidden>
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden />
          Diário de Viagem
        </Link>
        <nav>
          {isAdmin && <NewTripButton />}
          {user ? (
            <LogoutButton />
          ) : (
            <Link href="/entrar" className="topbar-link">
              Entrar
            </Link>
          )}
        </nav>
      </header>

      <section className="hero">
        <p className="eyebrow">Diário de viagem pessoal</p>
        <h1 className="hero-title">
          <Split text="Lugares que" />
          <em>
            <Split text="me guardaram" delay={0.2} />
          </em>
        </h1>
        <p className="hero-sub">
          Entre <RotatingWord />, cada viagem vira um capítulo — com fotos, histórias e o clima de onde eu estive.
        </p>
        {published.length > 0 && (
          <div className="hero-stats">
            <div className="stat">
              <b>{published.length}</b>
              <span>{published.length === 1 ? "viagem" : "viagens"}</span>
            </div>
            {days > 0 && (
              <div className="stat">
                <b>{days}</b>
                <span>dias na estrada</span>
              </div>
            )}
            {places > 0 && (
              <div className="stat">
                <b>{places}</b>
                <span>{places === 1 ? "destino" : "destinos"}</span>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="trips" id="viagens">
        <div className="trips-head">
          <h2>As viagens</h2>
          <p>{isAdmin ? "Rascunhos só aparecem para você" : "Toque em uma para ler"}</p>
        </div>
        {trips.length > 0 ? (
          <div className="trip-grid">
            {trips.map((t, i) => (
              <TripCard key={t.id} trip={t} index={i} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <strong>Nenhuma viagem por aqui ainda</strong>
            {isAdmin ? "Crie a primeira e escolha o visual dela." : "Volte em breve — as malas estão sendo feitas."}
            {isAdmin && (
              <div>
                <NewTripButton />
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="foot">
        <span>Diário de Viagem</span>
        <span>Escrito na estrada, salvo em tempo real.</span>
      </footer>
      <ReadingFx />
    </div>
  );
}
