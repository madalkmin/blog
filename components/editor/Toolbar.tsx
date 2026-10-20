"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import { useRef } from "react";
import { Icon, type IconName } from "../Icon";
import { Select } from "../Select";

type Block = "p" | "h2" | "h3";

const BLOCKS: { value: Block; label: string }[] = [
  { value: "p", label: "Texto" },
  { value: "h2", label: "Título" },
  { value: "h3", label: "Subtítulo" },
];

function Btn({ icon, label, on, disabled, onClick }: { icon: IconName; label: string; on?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`icon-btn ${on ? "on" : ""}`}
      aria-label={label}
      aria-pressed={on}
      title={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      <Icon name={icon} size={17} />
    </button>
  );
}

export function Toolbar({ editor, uploading, onImages }: { editor: Editor; uploading: number; onImages: (files: File[]) => void }) {
  const file = useRef<HTMLInputElement>(null);
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: (e.isActive("heading", { level: 2 }) ? "h2" : e.isActive("heading", { level: 3 }) ? "h3" : "p") as Block,
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      quote: e.isActive("blockquote"),
      list: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      link: e.isActive("link"),
      center: e.isActive({ textAlign: "center" }),
      undo: e.can().undo(),
      redo: e.can().redo(),
    }),
  });

  const setBlock = (b: Block) => {
    const chain = editor.chain().focus();
    if (b === "p") chain.setParagraph().run();
    else chain.setHeading({ level: b === "h2" ? 2 : 3 }).run();
  };

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Endereço do link (deixe vazio para remover)", prev ?? "https://");
    if (url === null) return;
    if (!url.trim() || url === "https://") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div className="toolbar" role="toolbar" aria-label="Formatação">
      <Select label="Estilo do parágrafo" value={s.block} options={BLOCKS} onChange={setBlock} />
      <span className="sep" />
      <Btn icon="bold" label="Negrito" on={s.bold} onClick={() => editor.chain().focus().toggleBold().run()} />
      <Btn icon="italic" label="Itálico" on={s.italic} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <Btn icon="strike" label="Riscado" on={s.strike} onClick={() => editor.chain().focus().toggleStrike().run()} />
      <Btn icon="link" label="Link" on={s.link} onClick={setLink} />
      <span className="sep" />
      <Btn icon="quote" label="Citação" on={s.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <Btn icon="list" label="Lista" on={s.list} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <Btn icon="listOrdered" label="Lista numerada" on={s.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <Btn
        icon={s.center ? "alignCenter" : "alignLeft"}
        label={s.center ? "Alinhar à esquerda" : "Centralizar"}
        on={s.center}
        onClick={() => editor.chain().focus().setTextAlign(s.center ? "left" : "center").run()}
      />
      <Btn icon="divider" label="Divisor" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      <span className="sep" />
      <Btn icon="image" label="Inserir imagens" onClick={() => file.current?.click()} />
      <input
        ref={file}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          onImages(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      <span className="sep" />
      <Btn icon="undo" label="Desfazer" disabled={!s.undo} onClick={() => editor.chain().focus().undo().run()} />
      <Btn icon="redo" label="Refazer" disabled={!s.redo} onClick={() => editor.chain().focus().redo().run()} />
      {uploading > 0 && <span className="uploading">Enviando {uploading > 1 ? `${uploading} imagens` : "imagem"}…</span>}
    </div>
  );
}
