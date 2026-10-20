import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getViewer, createClient } from "@/lib/supabase/server";
import { formatRange, tripDays } from "@/lib/format";
import { PRESET_INFO } from "@/lib/presets";
import { renderContent } from "@/lib/render";
import type { Section, Trip } from "@/lib/types";
import { Scene } from "@/components/scene/Scene";
import { ReadingFx } from "@/components/ReadingFx";
import { Icon } from "@/components/Icon";

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
  const info = PRESET_INFO[trip.preset];
  const days = tripDays(trip.start_date, trip.end_date);
  const range = formatRange(trip.start_date, trip.end_date);

  return (
    <div className="trip" data-preset={trip.preset}>
      <Scene preset={trip.preset} />
      <div className="progress" aria-hidden />

      <header className="trip-bar">
        <div className="group">
          <Link href="/" className="tbtn">
            <Icon name="arrowLeft" size={16} />
            <span className="label-wide">Todas as viagens</span>
          </Link>
        </div>
        {isAdmin && (
          <div className="group">
            {!trip.published && <span className="save">Rascunho — só você vê</span>}
            <Link href={`/editar/${trip.id}`} className="tbtn tbtn--accent">
              <Icon name="pen" size={16} />
              Editar
            </Link>
          </div>
        )}
      </header>

      <section className="trip-hero">
        <p className="trip-eyebrow">
          {info.emoji} {trip.location || info.label}
        </p>
        <h1 className="trip-title">{trip.title}</h1>
        {trip.subtitle && <p className="trip-subtitle">{trip.subtitle}</p>}
        {range && (
          <p className="trip-dates">
            {range}
            {days ? ` · ${days} ${days === 1 ? "dia" : "dias"}` : ""}
          </p>
        )}
        {trip.cover_url && (
          <div className="trip-cover">
            <img src={trip.cover_url} alt={trip.title} />
          </div>
        )}
        {sections.length > 0 && (
          <a href="#cap-1" className="scroll-cue">
            Começar a leitura
            <i />
          </a>
        )}
      </section>

      <div className="trip-layout">
        {sections.length > 1 && (
          <nav className="toc" aria-label="Capítulos">
            <p>Capítulos</p>
            <ol>
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#cap-${i + 1}`}>{s.title || `Capítulo ${i + 1}`}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <article className="chapters">
          {sections.map((s, i) => (
            <section key={s.id} id={`cap-${i + 1}`} className="chapter paper reveal">
              <span className="chapter-num">Capítulo {String(i + 1).padStart(2, "0")}</span>
              {s.title && <h2 className="chapter-title">{s.title}</h2>}
              <div className="prose" dangerouslySetInnerHTML={{ __html: s.html }} />
            </section>
          ))}
          {sections.length === 0 && <p className="paper empty-trip">Esta viagem ainda não tem capítulos.</p>}
        </article>
      </div>

      <footer className="trip-end">
        <h2 className="reveal">Fim da viagem</h2>
        <div className="group">
          <Link href="/" className="tbtn tbtn--accent">
            Ver outras viagens
            <Icon name="arrowRight" size={16} />
          </Link>
          <a href="#" className="tbtn">
            Voltar ao topo
          </a>
        </div>
      </footer>
      <ReadingFx />
    </div>
  );
}
