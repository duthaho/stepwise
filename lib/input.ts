export type Preset = "random" | "nearly" | "reversed" | "few";

export const PRESETS: { id: Preset; label: string }[] = [
  { id: "random", label: "Random" },
  { id: "nearly", label: "Nearly sorted" },
  { id: "reversed", label: "Reversed" },
  { id: "few", label: "Few unique" },
];

/** Deterministic default so server and client render the same first frame. */
export const DEFAULT_INPUT = [42, 9, 67, 25, 88, 13, 54, 31, 76, 5, 60, 21];

const randInt = (lo: number, hi: number) =>
  lo + Math.floor(Math.random() * (hi - lo + 1));

export function makeInput(preset: Preset, n: number): number[] {
  switch (preset) {
    case "random":
      return Array.from({ length: n }, () => randInt(5, 99));
    case "nearly": {
      const a = Array.from({ length: n }, (_, i) =>
        Math.round(5 + (i * 94) / Math.max(1, n - 1)),
      );
      const swaps = Math.max(1, Math.floor(n / 6));
      for (let s = 0; s < swaps; s++) {
        const i = randInt(0, n - 2);
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
      }
      return a;
    }
    case "reversed":
      return Array.from({ length: n }, (_, i) =>
        Math.round(99 - (i * 94) / Math.max(1, n - 1)),
      );
    case "few": {
      const pool = [15, 38, 62, 85];
      return Array.from({ length: n }, () => pool[randInt(0, pool.length - 1)]);
    }
  }
}

export function parseCustomInput(raw: string): number[] | null {
  const parts = raw
    .split(/[\s,]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 2 || parts.length > 32) return null;
  const nums = parts.map(Number);
  if (nums.some((v) => !Number.isFinite(v) || v < 1 || v > 999)) return null;
  return nums.map(Math.round);
}
