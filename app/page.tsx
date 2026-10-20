import Link from "next/link";
import { getViewer } from "@/lib/supabase/server";
import { tripDays } from "@/lib/format";
import type { Trip } from "@/lib/types";
import { TripCard } from "@/components/home/TripCard";
import { LogoutButton, NewTripButton } from "@/components/home/AdminActions";
import { ReadingFx } from "@/components/ReadingFx";

export const dynamic = "force-dynamic";

const stampDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" });

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
  const lastUpdate = published.reduce((max, t) => (t.updated_at > max ? t.updated_at : max), "");

  const stamp = [
    `Nº ${String(published.length).padStart(2, "0")}`,
    lastUpdate && `atualizado em ${stampDate.format(new Date(lastUpdate)).replace(/\//g, ".")}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <header className="wrap nav">
        <Link href="/" className="brand">
          Diário <b>/</b> de viagem
        </Link>
        <nav>
          {isAdmin && <NewTripButton />}
          {user ? (
            <LogoutButton />
          ) : (
            <Link href="/entrar" className="btn btn--quiet">
              Entrar
            </Link>
          )}
        </nav>
      </header>

      <main className="wrap">
        <section className="hero">
          <div>
            <div className="stamp reveal">{stamp}</div>
            <h1 className="reveal">
              Anotações de quem <i>vai e volta</i> diferente.
            </h1>
          </div>
          <div className="reveal">
            <p>Um caderno de bordo com fotos e o que ficou de cada lugar. Escrito na estrada, salvo em tempo real.</p>
            {published.length > 0 && (
              <span className="stamp">
                {published.length} {published.length === 1 ? "viagem" : "viagens"}
                {days > 0 && ` · ${days} dias na estrada`}
              </span>
            )}
          </div>
        </section>

        {trips.length > 0 ? (
          <div className="grid">
            {trips.map((t, i) => (
              <TripCard key={t.id} trip={t} index={i} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <strong>O caderno ainda está em branco</strong>
            {isAdmin ? "Crie a primeira viagem e comece a escrever." : "Volte em breve — as malas estão sendo feitas."}
            {isAdmin && (
              <div>
                <NewTripButton />
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="wrap foot">
        <span>Diário / de viagem</span>
        <span>Escrito na estrada</span>
      </footer>
      <ReadingFx />
    </>
  );
}
