import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, DM_Serif_Display, Fraunces, IBM_Plex_Mono, Newsreader, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./themes.css";

const serif = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--f-serif" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--f-mono" });
// Fontes de título dos presets: carregadas só quando usadas
const fraunces = Fraunces({ subsets: ["latin"], preload: false, display: "swap", style: ["normal", "italic"], variable: "--f-fraunces" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], preload: false, display: "swap", weight: ["500", "600"], variable: "--f-cormorant" });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], preload: false, display: "swap", weight: "400", style: ["normal", "italic"], variable: "--f-dmserif" });
const cinzel = Cinzel({ subsets: ["latin"], preload: false, display: "swap", variable: "--f-cinzel" });
const grotesk = Space_Grotesk({ subsets: ["latin"], preload: false, display: "swap", variable: "--f-grotesk" });

const fonts = [serif, mono, fraunces, cormorant, dmSerif, cinzel, grotesk].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  title: { default: "Diário de Viagem", template: "%s · Diário de Viagem" },
  description: "Anotações, fotos e lembranças de cada viagem.",
};

export const viewport: Viewport = {
  themeColor: "#efe7da",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={fonts} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
