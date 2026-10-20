export const PRESETS = ["floresta", "montanha", "praia", "deserto", "cidade"] as const;

export type Preset = (typeof PRESETS)[number];

export const PRESET_INFO: Record<Preset, { label: string; emoji: string; tagline: string }> = {
  floresta: { label: "Floresta", emoji: "🌲", tagline: "Musgo, vaga-lumes e folhas ao vento" },
  montanha: { label: "Montanha", emoji: "🏔️", tagline: "Neblina, neve e picos ao amanhecer" },
  praia: { label: "Praia", emoji: "🏖️", tagline: "Ondas, sol e brilho no mar" },
  deserto: { label: "Deserto", emoji: "🏜️", tagline: "Dunas, calor e areia no ar" },
  cidade: { label: "Cidade", emoji: "🌃", tagline: "Neon, chuva e janelas acesas" },
};

export function isPreset(value: unknown): value is Preset {
  return typeof value === "string" && (PRESETS as readonly string[]).includes(value);
}
