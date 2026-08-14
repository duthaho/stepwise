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

/* ---------- searching ---------- */

export type SearchPreset = "distinct" | "duplicates";

export const SEARCH_PRESETS: { id: SearchPreset; label: string }[] = [
  { id: "distinct", label: "Distinct" },
  { id: "duplicates", label: "Duplicates" },
];

/** Deterministic defaults so server and client render the same first frame. */
export const DEFAULT_SEARCH_INPUT = [5, 13, 21, 25, 31, 42, 54, 60, 67, 76, 88, 95];
export const DEFAULT_TARGET = 54;
export const DEFAULT_LIST_INPUT = [42, 9, 67, 25, 88, 13, 54, 31];
export const DEFAULT_TREE_INPUT = [42, 25, 67, 13, 31, 54, 88, 9, 76];
export const DEFAULT_GRAPH_INPUT = [42, 9, 67, 25, 88, 13, 54, 31];

/** Distinct values in random order — BSTs want no duplicates. */
export function makeDistinctInput(n: number): number[] {
  const set = new Set<number>();
  while (set.size < n) set.add(randInt(5, 99));
  const a = [...set];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function makeSearchInput(preset: SearchPreset, n: number): number[] {
  if (preset === "duplicates") {
    const pool = Array.from({ length: Math.max(2, Math.ceil(n / 3)) }, () =>
      randInt(5, 99),
    );
    return Array.from({ length: n }, () => pool[randInt(0, pool.length - 1)]).sort(
      (a, b) => a - b,
    );
  }
  const set = new Set<number>();
  while (set.size < n) set.add(randInt(5, 99));
  return [...set].sort((a, b) => a - b);
}

export function pickPresent(a: number[]): number {
  return a[randInt(0, a.length - 1)];
}

export function pickMissing(a: number[]): number {
  const present = new Set(a);
  for (let tries = 0; tries < 200; tries++) {
    const v = randInt(1, 99);
    if (!present.has(v)) return v;
  }
  return 100;
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
