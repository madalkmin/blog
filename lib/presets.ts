export const PRESETS = ["floresta", "montanha", "praia", "deserto", "cidade"] as const;

export type Preset = (typeof PRESETS)[number];

// Cada preset muda a fonte dos títulos e a cor dos detalhes (molduras, capitulares, notas)
export const PRESET_INFO: Record<Preset, { label: string; tagline: string }> = {
  floresta: { label: "Floresta", tagline: "Fraunces itálico · musgo" },
  montanha: { label: "Montanha", tagline: "Cormorant · ardósia" },
  praia: { label: "Praia", tagline: "DM Serif · verde-mar" },
  deserto: { label: "Deserto", tagline: "Cinzel · terracota" },
  cidade: { label: "Cidade", tagline: "Space Grotesk · grafite" },
};

export function isPreset(value: unknown): value is Preset {
  return typeof value === "string" && (PRESETS as readonly string[]).includes(value);
}
