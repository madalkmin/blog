import type { JSONContent } from "@tiptap/core";
import type { Preset } from "./presets";

export type Trip = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  location: string;
  preset: Preset;
  cover_url: string | null;
  start_date: string | null;
  end_date: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Section = {
  id: string;
  trip_id: string;
  title: string;
  content: JSONContent;
  position: number;
  created_at: string;
  updated_at: string;
};
