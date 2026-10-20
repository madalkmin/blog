"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { tripSlug } from "@/lib/format";
import type { Section, Trip } from "@/lib/types";
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
      requestAnimationFrame(() => document.querySelector("main > .chapter:last-of-type")?.scrollIntoView({ behavior: "smooth", block: "center" }));
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
      <header className="bar">
        <div className="group">
          <Link href="/" className="btn btn--quiet btn--icon" aria-label="Voltar para o início" title="Voltar para o início" onClick={flush}>
            ←
          </Link>
          <SaveIndicator />
        </div>
        <div className="group">
          <label className="switch">
            <input type="checkbox" checked={trip.published} onChange={(e) => edit({ published: e.target.checked })} />
            <span className="label-wide">{trip.published ? "Publicada" : "Rascunho"}</span>
          </label>
          <Link href={`/viagem/${trip.slug}`} className="btn btn--fill" onClick={flush}>
            Ver página
          </Link>
        </div>
      </header>

      <div className="wrap">
        <div className="trip-layout">
          <aside className="trip-aside">
            <div className="meta">
              <b>Visual</b>
              <PresetPicker value={trip.preset} onChange={(preset) => edit({ preset })} />
            </div>
            <div className="meta">
              <b>Local</b>
              <input className="aside-input" value={trip.location} placeholder="Onde foi?" aria-label="Local" onChange={(e) => edit({ location: e.target.value })} />
            </div>
            <div className="meta">
              <b>Ida</b>
              <input className="aside-input" type="date" value={trip.start_date ?? ""} aria-label="Data de ida" onChange={(e) => edit({ start_date: e.target.value || null })} />
            </div>
            <div className="meta">
              <b>Volta</b>
              <input
                className="aside-input"
                type="date"
                value={trip.end_date ?? ""}
                min={trip.start_date ?? undefined}
                aria-label="Data de volta"
                onChange={(e) => edit({ end_date: e.target.value || null })}
              />
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
            <AutoTextarea className="edit-field trip-title" value={trip.title} placeholder="Nome da viagem" aria-label="Título da viagem" onChange={(title) => edit({ title })} />
            <AutoTextarea
              className="edit-field trip-sub"
              value={trip.subtitle}
              placeholder="Uma frase que resuma a viagem…"
              aria-label="Subtítulo"
              onChange={(subtitle) => edit({ subtitle })}
            />
            <CoverUpload tripId={trip.id} value={trip.cover_url} onChange={(cover_url) => edit({ cover_url })} />

            {sections.map((s, i) => (
              <SectionEditor
                key={s.id}
                section={s}
                index={i}
                total={sections.length}
                onTitle={(title) => setSections((list) => list.map((x) => (x.id === s.id ? { ...x, title } : x)))}
                onMove={(dir) => moveSection(i, dir)}
                onDelete={() => setConfirm({ kind: "section", id: s.id })}
              />
            ))}
            <button type="button" className="add-chapter" onClick={() => void addSection()}>
              <Icon name="plus" size={16} />
              Novo capítulo
            </button>

            <div className="danger-zone">
              <button type="button" className="btn btn--quiet btn--danger" onClick={() => setConfirm({ kind: "trip" })}>
                Excluir viagem
              </button>
            </div>
          </main>
        </div>
      </div>

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
