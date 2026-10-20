import { Node } from "@tiptap/core";

export type FigureSize = "normal" | "larga" | "cheia";

export const FIGURE_SIZES: { value: FigureSize; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "larga", label: "Larga" },
  { value: "cheia", label: "Tela cheia" },
];

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figure: {
      insertFigure: (attrs: { src: string; alt?: string; caption?: string; size?: FigureSize }) => ReturnType;
    };
  }
}

// Imagem com legenda e tamanho. Compartilhada entre o editor (cliente) e a renderização do servidor.
export const Figure = Node.create({
  name: "figure",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      caption: { default: "" },
      size: { default: "normal" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure[data-figure]",
        getAttrs: (el) => {
          const node = el as HTMLElement;
          const img = node.querySelector("img");
          return {
            src: img?.getAttribute("src"),
            alt: img?.getAttribute("alt") ?? "",
            caption: node.querySelector("figcaption")?.textContent ?? "",
            size: node.getAttribute("data-size") ?? "normal",
          };
        },
      },
      {
        tag: "img[src]",
        getAttrs: (el) => ({ src: (el as HTMLElement).getAttribute("src"), alt: (el as HTMLElement).getAttribute("alt") ?? "" }),
      },
    ];
  },

  renderHTML({ node }) {
    const { src, alt, caption, size } = node.attrs;
    const img = ["img", { src, alt: alt || caption || "", loading: "lazy", decoding: "async" }];
    return caption
      ? ["figure", { "data-figure": "", "data-size": size, class: "fig reveal" }, img, ["figcaption", {}, caption]]
      : ["figure", { "data-figure": "", "data-size": size, class: "fig reveal" }, img];
  },

  addCommands() {
    return {
      insertFigure:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
