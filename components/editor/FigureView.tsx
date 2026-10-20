"use client";

import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { Figure, FIGURE_SIZES, type FigureSize } from "@/lib/tiptap/figure";
import { Select } from "../Select";
import { Icon } from "../Icon";

function FigureView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const { src, alt, caption, size } = node.attrs as { src: string; alt: string; caption: string; size: FigureSize };
  return (
    <NodeViewWrapper as="figure" className={`fig ${selected ? "is-selected" : ""}`} data-size={size}>
      <img src={src} alt={alt || caption} data-drag-handle draggable />
      <div className="fig-tools" contentEditable={false}>
        <Select label="Tamanho da imagem" value={size} options={FIGURE_SIZES} onChange={(v) => updateAttributes({ size: v })} />
        <button type="button" className="icon-btn icon-btn--danger" onClick={deleteNode} aria-label="Remover imagem" title="Remover imagem">
          <Icon name="trash" size={16} />
        </button>
      </div>
      <input
        className="fig-caption"
        value={caption}
        placeholder="Escreva uma legenda…"
        aria-label="Legenda da imagem"
        onChange={(e) => updateAttributes({ caption: e.target.value })}
      />
    </NodeViewWrapper>
  );
}

export const EditableFigure = Figure.extend({
  addNodeView() {
    return ReactNodeViewRenderer(FigureView);
  },
});
