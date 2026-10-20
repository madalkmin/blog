import type { CSSProperties } from "react";
import type { Preset } from "@/lib/presets";
import { H, W, pines, ridge, sineBand, skyline, wave } from "./rng";

const depth = (d: number) => ({ "--d": d }) as CSSProperties;

function Svg({ d, children, className = "" }: { d: number; children: React.ReactNode; className?: string }) {
  return (
    <svg className={`layer ${className}`} style={depth(d)} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
      {children}
    </svg>
  );
}

function Forest() {
  return (
    <>
      <div className="fx-glow" />
      <div className="fx-rays" />
      <Svg d={0.15}>
        <path d={pines(1, 38, 600, 150, 280)} fill="#1f4a33" opacity=".75" />
      </Svg>
      <div className="fx-mist" style={depth(0.25)} />
      <Svg d={0.35}>
        <path d={pines(2, 24, 740, 240, 400)} fill="#123222" />
      </Svg>
      <div className="fx-mist fx-mist--low" style={depth(0.45)} />
      <Svg d={0.6} className="layer--edges">
        <path d={pines(3, 11, 905, 420, 640)} fill="#08170f" />
      </Svg>
    </>
  );
}

function Mountain() {
  const caps = (id: string, top: number, bottom: number, color: string) => (
    <linearGradient id={id} x1="0" x2="0" y1={top} y2={bottom} gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset=".28" stopColor="#eef3fb" />
      <stop offset=".42" stopColor={color} />
      <stop offset="1" stopColor={color} />
    </linearGradient>
  );
  return (
    <>
      <div className="fx-sun" />
      <Svg d={0.08}>
        <defs>{caps("mtn-a", 180, 560, "#8fa6c4")}</defs>
        <path d={ridge(11, 540, 300)} fill="url(#mtn-a)" />
      </Svg>
      <div className="fx-mist" style={depth(0.15)} />
      <Svg d={0.2}>
        <defs>{caps("mtn-b", 330, 680, "#5d7495")}</defs>
        <path d={ridge(12, 660, 250)} fill="url(#mtn-b)" />
      </Svg>
      <div className="fx-mist fx-mist--low" style={depth(0.3)} />
      <Svg d={0.38}>
        <path d={ridge(13, 790, 170, 0.6)} fill="#30425b" />
      </Svg>
      <Svg d={0.55}>
        <path d={ridge(14, 890, 90, 0.7)} fill="#18243a" />
      </Svg>
    </>
  );
}

function Beach() {
  return (
    <>
      <div className="fx-sun" />
      <div className="fx-clouds" />
      <div className="fx-sea" />
      <div className="fx-waves">
        {[
          { base: 360, amp: 22, period: 800, fill: "#2fb7c9", o: 0.55, cls: "w1" },
          { base: 470, amp: 18, period: 533.33, fill: "#1aa0b8", o: 0.75, cls: "w2" },
          { base: 590, amp: 14, period: 400, fill: "#0e8aa6", o: 0.95, cls: "w3" },
        ].map((w) => (
          <svg key={w.cls} className={`wave ${w.cls}`} viewBox={`0 0 ${W * 2} ${H}`} preserveAspectRatio="none">
            <path d={wave(w.base, w.amp, w.period)} fill={w.fill} opacity={w.o} />
          </svg>
        ))}
      </div>
      <Svg d={0.4} className="layer--sand">
        <path d={sineBand(5, 860, 18)} fill="#f3dcae" />
        <path d={sineBand(6, 890, 10)} fill="#ead0a0" />
      </Svg>
    </>
  );
}

function Desert() {
  return (
    <>
      <div className="fx-stars" />
      <div className="fx-sun" />
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="heat">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves="2" seed="3">
            <animate attributeName="baseFrequency" dur="9s" values="0.012 0.06;0.016 0.09;0.012 0.06" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="9" />
        </filter>
      </svg>
      <Svg d={0.1}>
        <path d={sineBand(21, 610, 55)} fill="#a5523f" />
      </Svg>
      <Svg d={0.22} className="layer--heat">
        <path d={sineBand(22, 710, 70)} fill="#cf7446" />
      </Svg>
      <Svg d={0.4}>
        <path d={sineBand(23, 820, 55)} fill="#eb9a58" />
        <path d={sineBand(24, 880, 28)} fill="#f5b574" />
      </Svg>
    </>
  );
}

function City({ lite }: { lite: boolean }) {
  const back = skyline(31, 760, 120, 430, false);
  const front = skyline(32, 905, 160, 580, !lite);
  return (
    <>
      <div className="fx-stars" />
      <div className="fx-moon" />
      <Svg d={0.12}>
        {back.map((b, i) => (
          <rect key={i} x={b.x} y={760 - b.h} width={b.w} height={b.h + 140} fill="#1c1f45" />
        ))}
      </Svg>
      <div className="fx-neon" />
      <Svg d={0.32}>
        {front.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={905 - b.h} width={b.w} height={b.h} fill="#090a18" />
            {b.windows
              .filter((w) => w.on)
              .map((w, j) => (
                <rect
                  key={j}
                  x={w.x}
                  y={w.y}
                  width="6"
                  height="8"
                  className={w.flicker ? "win flicker" : "win"}
                  fill={w.hue ? "#7cf0ff" : "#ffd27a"}
                  style={w.flicker ? ({ animationDelay: `${(j * 0.37) % 7}s` } as CSSProperties) : undefined}
                />
              ))}
          </g>
        ))}
      </Svg>
    </>
  );
}

export function SceneLayers({ preset, lite = false }: { preset: Preset; lite?: boolean }) {
  switch (preset) {
    case "floresta":
      return <Forest />;
    case "montanha":
      return <Mountain />;
    case "praia":
      return <Beach />;
    case "deserto":
      return <Desert />;
    case "cidade":
      return <City lite={lite} />;
  }
}
