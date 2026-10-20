import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getViewer, createClient } from "@/lib/supabase/server";
import { formatRange, tripDays } from "@/lib/format";
import { PRESET_INFO } from "@/lib/presets";
import { renderContent } from "@/lib/render";
import type { Section, Trip } from "@/lib/types";
import { ReadingFx } from "@/components/ReadingFx";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("trips").select("title, subtitle, cover_url").eq("slug", slug).maybeSingle();
  if (!data) return { title: "Viagem não encontrada" };
  return {
    title: data.title,
    description: data.subtitle || undefined,
    openGraph: data.cover_url ? { images: [data.cover_url] } : undefined,
  };
}

export default async function TripPage({ params }: Props) {
  const { slug } = await params;
  const { supabase, isAdmin } = await getViewer();
  const { data: trip } = await supabase.from("trips").select("*").eq("slug", slug).maybeSingle<Trip>();
  if (!trip) notFound();

  const { data } = await supabase.from("sections").select("*").eq("trip_id", trip.id).order("position");
  const sections = ((data ?? []) as Section[]).map((s) => ({ ...s, html: renderContent(s.content) }));
  const days = tripDays(trip.start_date, trip.end_date);
  const range = formatRange(trip.start_date, trip.end_date);

  return (
    <div className="trip read" data-preset={trip.preset}>
      <div className="progress" aria-hidden />

      <header className="bar">
        <div className="group">
          <Link href="/" className="btn btn--quiet">
            ← <span className="label-wide">Todas as viagens</span>
          </Link>
        </div>
        <Link href="/" className="brand">
          <Logo variant="mini" className="brand-mark" title="" />
          <span className="label-wide">
            Diário <b>/</b> de viagem
          </span>
        </Link>
        <div className="group">
          {isAdmin ? (
            <Link href={`/editar/${trip.id}`} className="btn btn--fill">
              Editar
            </Link>
          ) : (
            <span />
          )}
        </div>
      </header>

      <div className="wrap">
        <div className="trip-layout">
          <aside className="trip-aside">
            {trip.location && (
              <div className="meta">
                <b>Local</b>
                {trip.location}
              </div>
            )}
            {range && (
              <div className="meta">
                <b>Quando</b>
                {range}
              </div>
            )}
            {days && (
              <div className="meta">
                <b>Duração</b>
                {days} {days === 1 ? "dia" : "dias"}
              </div>
            )}
            <div className="meta">
              <b>Visual</b>
              {PRESET_INFO[trip.preset].label}
              {!trip.published && " · rascunho"}
            </div>
            {sections.length > 1 && (
              <div className="toc-block">
                <b>Capítulos</b>
                <ol className="toc">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a href={`#cap-${i + 1}`}>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        {s.title || "Sem título"}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </aside>

          <main>
            <h1 className="trip-title reveal">{trip.title}</h1>
            {trip.subtitle && <p className="trip-sub reveal">{trip.subtitle}</p>}
            {trip.cover_url && (
              <figure className="trip-cover reveal">
                <img src={trip.cover_url} alt={trip.title} />
              </figure>
            )}

            {sections.map((s, i) => (
              <section key={s.id} id={`cap-${i + 1}`} className="chapter reveal">
                <span className="chapter-num">Capítulo {String(i + 1).padStart(2, "0")}</span>
                {s.title && <h2 className="chapter-title">{s.title}</h2>}
                <div className="prose" dangerouslySetInnerHTML={{ __html: s.html }} />
              </section>
            ))}
            {sections.length === 0 && <p className="empty-trip">Esta viagem ainda não tem capítulos.</p>}

            <div className="trip-stamp reveal" aria-hidden>
              <Logo id="stamp-end" />
            </div>
            <footer className="trip-end">
              <Link href="/" className="btn btn--fill">
                Outras viagens <span className="arrow">→</span>
              </Link>
              <a href="#" className="btn btn--quiet">
                Voltar ao topo
              </a>
            </footer>
          </main>
        </div>
      </div>
      <ReadingFx />
    </div>
  );
}
