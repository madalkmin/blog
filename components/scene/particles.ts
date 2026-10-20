import type { Preset } from "@/lib/presets";

export type P = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vr: number;
  life: number;
  max: number;
  color: string;
  phase: number;
  burst: boolean;
  kind: number;
};

type Sys = {
  ambient: number;
  spawn: (w: number, h: number, initial: boolean) => P;
  step: (p: P, t: number, w: number, h: number) => void;
  draw: (ctx: CanvasRenderingContext2D, p: P, t: number) => void;
  burst: (x: number, y: number) => P[];
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[(Math.random() * arr.length) | 0];

function base(partial: Partial<P>): P {
  return { x: 0, y: 0, vx: 0, vy: 0, r: 2, rot: 0, vr: 0, life: 0, max: Infinity, color: "#fff", phase: Math.random() * 6.28, burst: false, kind: 0, ...partial };
}

function fade(p: P) {
  if (!Number.isFinite(p.max)) return 1;
  const k = p.life / p.max;
  return k < 0.15 ? k / 0.15 : 1 - Math.max(0, (k - 0.6) / 0.4);
}

function leaf(ctx: CanvasRenderingContext2D, p: P) {
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.scale(1, 0.55 + 0.45 * Math.sin(p.phase));
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(0, -p.r);
  ctx.quadraticCurveTo(p.r * 0.9, 0, 0, p.r);
  ctx.quadraticCurveTo(-p.r * 0.9, 0, 0, -p.r);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,.25)";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, -p.r);
  ctx.lineTo(0, p.r);
  ctx.stroke();
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function flake(ctx: CanvasRenderingContext2D, p: P) {
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.strokeStyle = p.color;
  ctx.lineWidth = Math.max(0.8, p.r / 5);
  ctx.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, p.r);
    ctx.moveTo(0, p.r * 0.55);
    ctx.lineTo(p.r * 0.25, p.r * 0.8);
    ctx.moveTo(0, p.r * 0.55);
    ctx.lineTo(-p.r * 0.25, p.r * 0.8);
    ctx.stroke();
  }
}

const LEAVES = ["#c98b2b", "#8aa83a", "#d9a441", "#6f8f2a", "#b5562b"];

const forest: Sys = {
  ambient: 46,
  spawn: (w, h, initial) =>
    Math.random() < 0.55
      ? base({ kind: 0, x: rand(0, w), y: initial ? rand(0, h) : -20, vx: rand(-0.3, 0.3), vy: rand(0.35, 0.9), r: rand(5, 10), vr: rand(-0.03, 0.03), color: pick(LEAVES) })
      : base({ kind: 1, x: rand(0, w), y: rand(h * 0.35, h), vx: rand(-0.25, 0.25), vy: rand(-0.2, 0.2), r: rand(1.4, 2.6), color: "#f6e27a" }),
  step: (p, t, w, h) => {
    if (p.kind === 0) {
      p.x += p.vx + Math.sin(t * 0.0012 + p.phase) * 0.6;
      p.y += p.vy;
      p.rot += p.vr;
      p.phase += 0.04;
      if (p.y > h + 30) p.life = p.max = 1;
    } else {
      p.vx += rand(-0.03, 0.03);
      p.vy += rand(-0.03, 0.03);
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < h * 0.2 || p.y > h + 10) p.vy *= -1;
    }
  },
  draw: (ctx, p, t) => {
    if (p.kind === 0) {
      ctx.globalAlpha = 0.9 * fade(p);
      leaf(ctx, p);
    } else {
      const pulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.0015 + p.phase));
      glow(ctx, p.x, p.y, p.r * 7, "rgba(246,226,122,.9)", pulse * 0.55 * fade(p));
      ctx.globalAlpha = pulse * fade(p);
      ctx.fillStyle = "#fffbd0";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  burst: (x, y) =>
    Array.from({ length: 14 }, () => {
      const a = rand(0, Math.PI * 2);
      const s = rand(1.5, 4.5);
      return base({ kind: 0, burst: true, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.5, r: rand(5, 9), vr: rand(-0.2, 0.2), max: rand(70, 110), color: pick(LEAVES) });
    }),
};

const mountain: Sys = {
  ambient: 120,
  spawn: (w, h, initial) => {
    const depth = Math.random();
    return base({ x: rand(0, w), y: initial ? rand(0, h) : -10, vx: rand(-0.2, 0.4), vy: 0.3 + depth * 1.1, r: 0.8 + depth * 2.6, color: "rgba(255,255,255,.85)", kind: depth > 0.85 ? 1 : 0 });
  },
  step: (p, t, w, h) => {
    p.x += p.vx + Math.sin(t * 0.0008 + p.phase) * 0.35;
    p.y += p.vy;
    p.rot += p.vr;
    if (p.burst) {
      p.vx *= 0.97;
      p.vy = p.vy * 0.97 + 0.03;
    }
    if (p.y > h + 10) p.life = p.max = 1;
    if (p.x > w + 10) p.x = -10;
  },
  draw: (ctx, p) => {
    ctx.globalAlpha = 0.85 * fade(p);
    if (p.kind === 1 || p.burst) {
      flake(ctx, p);
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  burst: (x, y) =>
    Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const s = rand(2, 4);
      return base({ burst: true, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rand(5, 9), vr: rand(-0.06, 0.06), max: rand(60, 90), color: "#ffffff", kind: 1 });
    }),
};

const beach: Sys = {
  ambient: 40,
  spawn: (w, h, initial) =>
    base({ x: rand(0, w), y: initial ? rand(h * 0.3, h) : h + 10, vx: 0, vy: -rand(0.2, 0.6), r: rand(1.5, 4.5), color: pick(["#ffffff", "#bff4ff", "#fff3c4"]), max: rand(500, 900) }),
  step: (p, t) => {
    p.x += Math.sin(t * 0.002 + p.phase) * 0.4 + p.vx;
    p.y += p.vy;
    if (p.burst) {
      p.vx *= 0.95;
      p.vy = p.vy * 0.95 - 0.05;
      p.r += 0.12;
    }
  },
  draw: (ctx, p, t) => {
    const a = fade(p);
    if (p.burst) {
      ctx.globalAlpha = a * 0.9;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    const tw = 0.5 + 0.5 * Math.sin(t * 0.004 + p.phase);
    ctx.globalAlpha = a * (0.35 + tw * 0.55);
    ctx.fillStyle = p.color;
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.PI / 4);
    const s = p.r * (0.6 + tw * 0.6);
    ctx.fillRect(-s / 6, -s, s / 3, s * 2);
    ctx.fillRect(-s, -s / 6, s * 2, s / 3);
  },
  burst: (x, y) =>
    Array.from({ length: 10 }, () => {
      const a = rand(0, Math.PI * 2);
      const s = rand(0.8, 2.6);
      return base({ burst: true, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rand(3, 9), max: rand(50, 90), color: pick(["#ffffff", "#bff4ff", "#9fe8ff"]) });
    }),
};

const SAND = ["#f3c27a", "#e7a95e", "#ffd9a0", "#d98c4a"];

const desert: Sys = {
  ambient: 150,
  spawn: (w, h, initial) => {
    const fast = Math.random();
    return base({ x: initial ? rand(0, w) : -10, y: rand(h * 0.25, h), vx: 0.8 + fast * 3.2, vy: rand(-0.15, 0.15), r: 0.6 + fast * 1.6, color: pick(SAND) });
  },
  step: (p, t, w) => {
    p.x += p.vx;
    p.y += p.vy + Math.sin(t * 0.003 + p.phase) * 0.3;
    if (p.burst) {
      p.vx *= 0.96;
      p.vy += 0.08;
    }
    if (p.x > w + 20) p.life = p.max = 1;
  },
  draw: (ctx, p) => {
    ctx.globalAlpha = 0.75 * fade(p);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.r * (p.burst ? 1 : 2.2), p.r, 0, 0, Math.PI * 2);
    ctx.fill();
  },
  burst: (x, y) =>
    Array.from({ length: 26 }, () => {
      const a = rand(-Math.PI, 0);
      const s = rand(1.5, 5);
      return base({ burst: true, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rand(1, 2.6), max: rand(40, 80), color: pick(SAND) });
    }),
};

const NEON = ["#ff3ea5", "#38e8ff", "#b46bff", "#ffe14d"];

const city: Sys = {
  ambient: 140,
  spawn: (w, h, initial) => base({ x: rand(-100, w), y: initial ? rand(0, h) : -30, vx: 2.2, vy: rand(11, 17), r: rand(10, 24), color: "rgba(170,200,255,.35)" }),
  step: (p, _t, _w, h) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.burst) {
      p.vx *= 0.93;
      p.vy = p.vy * 0.93 + 0.1;
    }
    if (p.y > h + 30) p.life = p.max = 1;
  },
  draw: (ctx, p) => {
    ctx.globalAlpha = fade(p);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = p.burst ? 2 : 1;
    if (p.burst) {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
    }
    const len = p.burst ? 3 : p.r / Math.hypot(p.vx, p.vy);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx * len, p.y - p.vy * len);
    ctx.stroke();
  },
  burst: (x, y) =>
    Array.from({ length: 18 }, () => {
      const a = rand(0, Math.PI * 2);
      const s = rand(3, 8);
      return base({ burst: true, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 6, max: rand(25, 45), color: pick(NEON) });
    }),
};

export const SYSTEMS: Record<Preset, Sys> = { floresta: forest, montanha: mountain, praia: beach, deserto: desert, cidade: city };
