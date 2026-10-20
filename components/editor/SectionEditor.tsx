"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { contentExtensions } from "@/lib/tiptap/extensions";
import { uploadImage } from "@/lib/upload";
import type { Section } from "@/lib/types";
import { EditableFigure } from "./FigureView";
import { Toolbar } from "./Toolbar";
import { AutoTextarea } from "./AutoTextarea";
import { useAutosave } from "./save";
import { Icon } from "../Icon";

type Props = {
  section: Section;
  index: number;
  total: number;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
};

export function SectionEditor({ section, index, total, onMove, onDelete }: Props) {
  const supabase = createClient();
  const [title, setTitle] = useState(section.title);
  const [uploading, setUploading] = useState(0);

  const { queue } = useAutosave<Pick<Section, "title" | "content">>(`section:${section.id}`, async (patch) => {
    const { error } = await supabase.from("sections").update(patch).eq("id", section.id);
    if (error) throw error;
  });

  // Envia imagens e insere na posição indicada (ou no cursor)
  const insertImages = useCallback(
    async (files: File[], pos?: number) => {
      const images = files.filter((f) => f.type.startsWith("image/"));
      if (!images.length || !editorRef.current) return;
      setUploading((n) => n + images.length);
      for (const file of images) {
        try {
          const src = await uploadImage(supabase, section.trip_id, file);
          const ed = editorRef.current;
          if (!ed) break;
          const chain = ed.chain().focus();
          if (pos !== undefined) chain.insertContentAt(pos, { type: "figure", attrs: { src } }).run();
          else chain.insertFigure({ src }).run();
        } catch (err) {
          console.error(err);
          window.alert(`Não foi possível enviar ${file.name}.`);
        } finally {
          setUploading((n) => n - 1);
        }
      }
    },
    [section.trip_id, supabase],
  );
  const insertRef = useRef(insertImages);
  insertRef.current = insertImages;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      ...contentExtensions,
      EditableFigure,
      Placeholder.configure({ placeholder: "Conte como foi este pedaço da viagem… (arraste fotos para cá)" }),
    ],
    content: section.content,
    editorProps: {
      attributes: { class: "prose", "aria-label": "Texto do capítulo" },
      handleDrop: (view, event, _slice, moved) => {
        const files = Array.from(event.dataTransfer?.files ?? []);
        if (moved || !files.length) return false;
        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        void insertRef.current(files, pos);
        return true;
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        if (!files.length) return false;
        void insertRef.current(files);
        return true;
      },
    },
    onUpdate: ({ editor }) => queue({ content: editor.getJSON() }),
  });
  const editorRef = useRef(editor);
  editorRef.current = editor;

  return (
    <section className="chapter paper">
      <div className="chapter-head">
        <span className="chapter-num">Capítulo {String(index + 1).padStart(2, "0")}</span>
        <div className="chapter-tools">
          <button type="button" className="icon-btn" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Mover para cima" title="Mover para cima">
            <Icon name="up" />
          </button>
          <button type="button" className="icon-btn" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Mover para baixo" title="Mover para baixo">
            <Icon name="down" />
          </button>
          <button type="button" className="icon-btn icon-btn--danger" onClick={onDelete} aria-label="Excluir capítulo" title="Excluir capítulo">
            <Icon name="trash" />
          </button>
        </div>
      </div>
      <AutoTextarea
        className="chapter-title chapter-title-input"
        value={title}
        placeholder="Título do capítulo"
        aria-label="Título do capítulo"
        onChange={(v) => {
          setTitle(v);
          queue({ title: v });
        }}
      />
      {editor && <Toolbar editor={editor} uploading={uploading} onImages={(files) => void insertImages(files)} />}
      <EditorContent editor={editor} />
    </section>
  );
}
