import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Figure } from "./figure";

export const contentExtensions = [
  StarterKit.configure({ heading: { levels: [2, 3] } }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    protocols: ["http", "https", "mailto"],
    HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
  }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
];

export const sharedExtensions = [...contentExtensions, Figure];
