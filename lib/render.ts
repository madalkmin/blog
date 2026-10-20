import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import { sharedExtensions } from "./tiptap/extensions";

export function renderContent(doc: JSONContent | null | undefined) {
  if (!doc?.content?.length) return "";
  try {
    return generateHTML(doc, sharedExtensions);
  } catch {
    return "";
  }
}
