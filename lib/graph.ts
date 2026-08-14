/**
 * Deterministic random graph derived from the input values, so the same
 * input always draws the same graph (SSR-safe) and "new graph" just means
 * new seed values.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type WeightedEdge = [number, number, number];

export function buildGraph(values: number[]): {
  edges: WeightedEdge[];
  adj: [number, number][][]; // adj[u] = [v, w][]
} {
  const n = values.length;
  let seed = n * 2654435761;
  for (const v of values) seed = (seed * 31 + v) >>> 0;
  const rnd = mulberry32(seed);
  const randInt = (lo: number, hi: number) =>
    lo + Math.floor(rnd() * (hi - lo + 1));

  const has = new Set<string>();
  const edges: WeightedEdge[] = [];
  const add = (u: number, v: number) => {
    const k = u < v ? `${u}-${v}` : `${v}-${u}`;
    if (u === v || has.has(k)) return false;
    has.add(k);
    edges.push(u < v ? [u, v, randInt(1, 9)] : [v, u, randInt(1, 9)]);
    return true;
  };

  // Spanning tree first (connected), then a few extra edges.
  for (let i = 1; i < n; i++) add(i, randInt(0, i - 1));
  let extras = Math.floor(n / 2);
  let guard = 40;
  while (extras > 0 && guard-- > 0) {
    if (add(randInt(0, n - 1), randInt(0, n - 1))) extras--;
  }

  const adj: [number, number][][] = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) {
    adj[u].push([v, w]);
    adj[v].push([u, w]);
  }
  for (const list of adj) list.sort((a, b) => a[0] - b[0]);
  return { edges, adj };
}
