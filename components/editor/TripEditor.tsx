"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { createClient } from "@/lib/supabase/client";
import { tripSlug } from "@/lib/format";
import type { Preset } from "@/lib/presets";
import type { Section, Trip } from "@/lib/types";
import { Scene } from "../scene/Scene";
import { PresetPicker } from "../PresetPicker";
import { Icon } from "../Icon";
import { AutoTextarea } from "./AutoTextarea";
import { CoverUpload } from "./CoverUpload";
import { Confirm } from "./Confirm";
import { SectionEditor } from "./SectionEditor";
import { SaveIndicator, SaveProvider, useAutosave, useSaveTracker } from "./save";

type Pending = { kind: "section"; id: string } | { kind: "trip" } | null;

function Editor({ initialTrip, initialSections }: { initialTrip: Trip; initialSections: Section[] }) {
  const supabase = createClient();
  const router = useRouter();
  const tracker = useSaveTracker();
  const [trip, setTrip] = useState(initialTrip);
  const [sections, setSections] = useState(initialSections);
  const [wipe, setWipe] = useState<{ preset: Preset; x: number; y: number; key: number } | null>(null);
  const [confirm, setConfirm] = useState<Pending>(null);

  const { queue, flush } = useAutosave<Partial<Trip>>(`trip:${trip.id}`, async (patch) => {
    const { error } = await supabase.from("trips").update(patch).eq("id", trip.id);
    if (error) throw error;
  });

  const edit = (patch: Partial<Trip>) => {
    // Enquanto for rascunho, o endereço acompanha o título
    if ("title" in patch && !trip.published) patch = { ...patch, slug: tripSlug(patch.title || "viagem", trip.id) };
    setTrip((t) => ({ ...t, ...patch }));
    queue(patch);
  };

  const changePreset = (preset: Preset, origin: { x: number; y: number }) => {
    if (preset === trip.preset) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      edit({ preset });
      return;
    }
    setWipe({ preset, ...origin, key: Date.now() });
    setTimeout(() => edit({ preset }), 420);
    setTimeout(() => setWipe(null), 950);
  };

  const addSection = async () => {
    const position = sections.reduce((m, s) => Math.max(m, s.position), -1) + 1;
    const p = Promise.resolve(
      supabase
      .from("sections")
      .insert({ trip_id: trip.id, title: `Dia ${sections.length + 1}`, position })
      .select("*")
      .single(),
    ).then(({ data, error }) => {
        if (error || !data) throw error;
        setSections((list) => [...list, data as Section]);
        requestAnimationFrame(() => document.querySelector(".chapters > .chapter:last-of-type")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      });
    await tracker.track("new-section", p);
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= sections.length) return;
    const a = sections[index];
    const b = sections[j];
    const list = [...sections];
    list[index] = { ...b, position: a.position };
    list[j] = { ...a, position: b.position };
    setSections(list);
    void tracker.track(
      `order:${a.id}`,
      Promise.all([
        supabase.from("sections").update({ position: b.position }).eq("id", a.id),
        supabase.from("sections").update({ position: a.position }).eq("id", b.id),
      ]).then((res) => {
        const err = res.find((r) => r.error)?.error;
        if (err) throw err;
      }),
    );
  };

  const deleteSection = (id: string) => {
    setSections((list) => list.filter((s) => s.id !== id));
    void tracker.track(
      `delete:${id}`,
      Promise.resolve(supabase.from("sections").delete().eq("id", id)).then(({ error }) => {
        if (error) throw error;
      }),
    );
  };

  const deleteTrip = async () => {
    const { data: files } = await supabase.storage.from("media").list(trip.id, { limit: 1000 });
    if (files?.length) await supabase.storage.from("media").remove(files.map((f) => `${trip.id}/${f.name}`));
    const { error } = await supabase.from("trips").delete().eq("id", trip.id);
    if (error) {
      window.alert("Não foi possível excluir a viagem.");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="trip editing" data-preset={trip.preset}>
      <Scene preset={trip.preset} bursts={false} />

      <header className="trip-bar">
        <div className="group">
          <Link href="/" className="tbtn tbtn--icon" aria-label="Voltar para o início" title="Voltar para o início" onClick={flush}>
            <Icon name="arrowLeft" size={16} />
          </Link>
          <SaveIndicator />
        </div>
        <div className="group">
          <label className="switch">
            <input type="checkbox" checked={trip.published} onChange={(e) => edit({ published: e.target.checked })} />
            <span className="label-wide">{trip.published ? "Publicada" : "Rascunho"}</span>
          </label>
          <Link href={`/viagem/${trip.slug}`} className="tbtn tbtn--accent" onClick={flush}>
            <Icon name="eye" size={16} />
            <span className="label-wide">Ver página</span>
          </Link>
        </div>
      </header>

      <section className="trip-hero">
        <PresetPicker value={trip.preset} onChange={changePreset} />
        <input
          className="hero-input trip-eyebrow"
          value={trip.location}
          placeholder="Onde? Ex.: Chapada Diamantina, BA"
          aria-label="Local"
          onChange={(e) => edit({ location: e.target.value })}
        />
        <AutoTextarea
          className="hero-input trip-title"
          value={trip.title}
          placeholder="Nome da viagem"
          aria-label="Título da viagem"
          onChange={(title) => edit({ title })}
        />
        <AutoTextarea
          className="hero-input trip-subtitle"
          value={trip.subtitle}
          placeholder="Uma frase que resuma a viagem…"
          aria-label="Subtítulo"
          onChange={(subtitle) => edit({ subtitle })}
        />
        <div className="date-row">
          <label>
            Ida
            <input type="date" value={trip.start_date ?? ""} onChange={(e) => edit({ start_date: e.target.value || null })} />
          </label>
          <label>
            Volta
            <input type="date" value={trip.end_date ?? ""} min={trip.start_date ?? undefined} onChange={(e) => edit({ end_date: e.target.value || null })} />
          </label>
        </div>
        <CoverUpload tripId={trip.id} value={trip.cover_url} onChange={(cover_url) => edit({ cover_url })} />
      </section>

      <div className="chapters">
        {sections.map((s, i) => (
          <SectionEditor
            key={s.id}
            section={s}
            index={i}
            total={sections.length}
            onMove={(dir) => moveSection(i, dir)}
            onDelete={() => setConfirm({ kind: "section", id: s.id })}
          />
        ))}
        <button type="button" className="add-chapter" onClick={() => void addSection()}>
          <Icon name="plus" />
          Novo capítulo
        </button>
      </div>

      <div className="danger-zone">
        <button type="button" className="tbtn" onClick={() => setConfirm({ kind: "trip" })}>
          <Icon name="trash" size={16} />
          Excluir viagem
        </button>
      </div>

      {wipe && (
        <div
          key={wipe.key}
          className="wipe"
          data-preset={wipe.preset}
          style={{ "--wx": `${wipe.x}px`, "--wy": `${wipe.y}px` } as CSSProperties}
        />
      )}

      {confirm?.kind === "section" && (
        <Confirm
          title="Excluir capítulo?"
          text="O texto e as imagens deste capítulo serão apagados. Isso não pode ser desfeito."
          confirmLabel="Excluir"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            deleteSection(confirm.id);
            setConfirm(null);
          }}
        />
      )}
      {confirm?.kind === "trip" && (
        <Confirm
          title="Excluir esta viagem?"
          text="Todos os capítulos, textos e fotos desta viagem serão apagados para sempre."
          confirmLabel="Excluir viagem"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            setConfirm(null);
            void deleteTrip();
          }}
        />
      )}
    </div>
  );
}

export function TripEditor(props: { initialTrip: Trip; initialSections: Section[] }) {
  return (
    <SaveProvider>
      <Editor {...props} />
    </SaveProvider>
  );
}
