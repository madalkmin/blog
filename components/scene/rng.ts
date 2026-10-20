// RNG determinístico: servidor e cliente geram as mesmas paisagens (sem erro de hidratação)
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Arredonda para evitar diferenças de ponto flutuante entre servidor e navegador
const q = (n: number) => Math.round(n * 10) / 10;

export const W = 1600;
export const H = 900;

export function pines(seed: number, count: number, base: number, minH: number, maxH: number) {
  const r = rng(seed);
  let d = "";
  for (let i = 0; i < count; i++) {
    const x = q((i / count) * (W + 120) - 60 + r() * 40);
    const h = q(minH + r() * (maxH - minH));
    const w = q(h * (0.22 + r() * 0.08));
    const top = base - h;
    d += `M${x - 3},${base} L${x - 3},${q(base - h * 0.15)} L${x + 3},${q(base - h * 0.15)} L${x + 3},${base} Z `;
    for (let t = 0; t < 3; t++) {
      const ty = q(top + (h * t) / 3.4);
      const tw = q(w * (0.55 + t * 0.25));
      const tb = q(ty + h * 0.45);
      d += `M${x - tw},${tb} L${x},${ty} L${x + tw},${tb} Z `;
    }
  }
  return d + `M0,${base} L${W},${base} L${W},${H} L0,${H} Z`;
}

export function ridge(seed: number, base: number, amp: number, roughness = 0.55) {
  const r = rng(seed);
  const n = 65;
  const pts = new Array(n).fill(0);
  pts[0] = r() * amp;
  pts[n - 1] = r() * amp;
  const split = (a: number, b: number, s: number) => {
    if (b - a < 2) return;
    const m = (a + b) >> 1;
    pts[m] = (pts[a] + pts[b]) / 2 + (r() - 0.5) * s;
    split(a, m, s * roughness);
    split(m, b, s * roughness);
  };
  split(0, n - 1, amp * 1.6);
  let d = `M0,${H} `;
  pts.forEach((p, i) => (d += `L${q((i / (n - 1)) * W)},${q(base - Math.max(0, p))} `));
  return d + `L${W},${H} Z`;
}

export function sineBand(seed: number, base: number, amp: number, width = W, step = 16) {
  const r = rng(seed);
  const f = [0.004 + r() * 0.002, 0.009 + r() * 0.004, 0.0021 + r() * 0.001];
  const ph = [r() * 6, r() * 6, r() * 6];
  let d = `M0,${H} `;
  for (let x = 0; x <= width; x += step) {
    const y = base - amp * (Math.sin(x * f[0] + ph[0]) * 0.6 + Math.sin(x * f[1] + ph[1]) * 0.25 + Math.sin(x * f[2] + ph[2]) * 0.5);
    d += `L${x},${y.toFixed(1)} `;
  }
  return d + `L${width},${H} Z`;
}

// Onda periódica (2 períodos de W) para deslizar em loop sem emenda
export function wave(base: number, amp: number, period: number) {
  let d = `M0,${H} `;
  for (let x = 0; x <= W * 2; x += 10) {
    const y = base + Math.sin((x / period) * Math.PI * 2) * amp + Math.sin((x / (period / 2)) * Math.PI * 2) * amp * 0.25;
    d += `L${x},${y.toFixed(1)} `;
  }
  return d + `L${W * 2},${H} Z`;
}

export type Building = { x: number; w: number; h: number; windows: { x: number; y: number; on: boolean; flicker: boolean; hue: number }[] };

export function skyline(seed: number, base: number, minH: number, maxH: number, withWindows: boolean): Building[] {
  const r = rng(seed);
  const out: Building[] = [];
  let x = -20;
  while (x < W + 20) {
    const w = q(40 + r() * 90);
    const h = q(minH + Math.pow(r(), 1.6) * (maxH - minH));
    const windows: Building["windows"] = [];
    if (withWindows) {
      for (let wy = base - h + 14; wy < base - 12; wy += 16) {
        for (let wx = x + 8; wx < x + w - 10; wx += 13) {
          const on = r() < 0.32;
          windows.push({ x: q(wx), y: q(wy), on, flicker: on && r() < 0.12, hue: r() < 0.8 ? 0 : 1 });
        }
      }
    }
    out.push({ x, w, h, windows });
    x = q(x + w + r() * 6);
  }
  return out;
}
