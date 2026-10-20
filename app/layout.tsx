import type { Metadata, Viewport } from "next";
import {
  Caveat,
  Cinzel,
  Crimson_Pro,
  Fraunces,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
  Lora,
  Nunito,
  Oswald,
  Source_Serif_4,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import "./themes.css";

const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--f-instrument" });
const inter = Inter({ subsets: ["latin"], variable: "--f-inter" });
const fraunces = Fraunces({ subsets: ["latin"], preload: false, display: "swap", variable: "--f-fraunces", style: ["normal", "italic"] });
const lora = Lora({ subsets: ["latin"], preload: false, display: "swap", variable: "--f-lora", style: ["normal", "italic"] });
const oswald = Oswald({ subsets: ["latin"], preload: false, display: "swap", variable: "--f-oswald" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], preload: false, display: "swap", variable: "--f-source-serif", style: ["normal", "italic"] });
const caveat = Caveat({ subsets: ["latin"], preload: false, display: "swap", variable: "--f-caveat" });
const nunito = Nunito({ subsets: ["latin"], preload: false, display: "swap", variable: "--f-nunito", style: ["normal", "italic"] });
const cinzel = Cinzel({ subsets: ["latin"], preload: false, display: "swap", variable: "--f-cinzel" });
const crimson = Crimson_Pro({ subsets: ["latin"], preload: false, display: "swap", variable: "--f-crimson", style: ["normal", "italic"] });
const grotesk = Space_Grotesk({ subsets: ["latin"], preload: false, display: "swap", variable: "--f-grotesk" });
const mono = JetBrains_Mono({ subsets: ["latin"], preload: false, display: "swap", variable: "--f-mono" });

const fonts = [instrument, inter, fraunces, lora, oswald, sourceSerif, caveat, nunito, cinzel, crimson, grotesk, mono]
  .map((f) => f.variable)
  .join(" ");

export const metadata: Metadata = {
  title: { default: "Diário de Viagem", template: "%s · Diário de Viagem" },
  description: "Histórias, fotos e lembranças de cada viagem.",
};

export const viewport: Viewport = {
  themeColor: "#0e0d0b",
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
