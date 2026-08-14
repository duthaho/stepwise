import { Algorithm, Tracer } from "../trace";
import { buildGraph } from "../graph";

export const dijkstra: Algorithm = {
  id: "dijkstra",
  name: "Dijkstra",
  tagline: "Always settle the cheapest unsettled node — greed that is provably right.",
  stackLabel: "pq · node:dist",
  code: `function dijkstra(g: [number, number][][], s: number) {
  const dist = new Array(g.length).fill(Infinity);
  dist[s] = 0;
  const pq = [[0, s]]; // [dist, node] — use a heap in production
  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;
    if (d > dist[u]) continue; // stale entry
    for (const [v, w] of g[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
      }
    }
  }
  return dist;
}`,
  facts: [
    { label: "time", value: "O((V+E) log V)" },
    { label: "space", value: "O(V)" },
    { label: "requires", value: "no negative weights" },
    { label: "finds", value: "cheapest paths" },
  ],
  intuition: [
    "Edges now have costs, so “fewest edges” no longer means “cheapest” — a 3-hop path of weight 1s beats a 1-hop path of weight 9. Dijkstra fixes BFS with one change: the frontier becomes a priority queue, and the node settled next is always the one with the smallest tentative distance. The numbers on the edges are the weights; watch the dist labels shrink as better routes are found — that shrink is called relaxation.",
    "Why greed is safe here: when the cheapest unsettled node u comes off the queue, every alternative route to u would have to pass through something already more expensive — with no negative edges, it can only get worse. So dist[u] is final. That argument collapses if any edge is negative (a later cheap detour could win), which is exactly why Dijkstra forbids them; Bellman-Ford is the fallback and worth naming in an interview.",
    "Two implementation notes that separate working code from almost-working code: this demo sorts an array each round for honesty about what a priority queue does — production uses a binary heap for the log V; and rather than updating an entry inside the queue (hard), just push a duplicate and discard stale ones on arrival (the d > dist[u] check). That lazy-deletion trick is the standard answer to “but how do you decrease-key?”.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    const { edges, adj } = buildGraph(input);
    const dist: number[] = Array.from({ length: n }, () => Infinity);
    const L = () => dist.map((d) => (d === Infinity ? "∞" : String(d)));
    dist[0] = 0;
    const pq: [number, number][] = [[0, 0]];
    const pqStack = () => pq.map(([, v]) => v);
    t.emit(4, "Start: node 0 at distance 0, everything else ∞. Edge numbers are weights.", {
      graphEdges: edges,
      labels: L(),
      stack: pqStack(),
    });
    let guard = 0;
    while (pq.length > 0 && guard++ < 200) {
      pq.sort((a, b) => a[0] - b[0]);
      const [d, u] = pq.shift()!;
      if (d > dist[u]) {
        t.emit(8, `Node ${u} at ${d} is stale — it was settled cheaper (${dist[u]}). Discard.`, {
          graphEdges: edges,
          labels: L(),
          stack: pqStack(),
        });
        continue;
      }
      t.markSorted(u);
      t.emit(7, `Settle node ${u} at distance ${d} — nothing unsettled can reach it cheaper.`, {
        graphEdges: edges,
        labels: L(),
        stack: pqStack(),
        compare: [u],
      });
      for (const [v, w] of adj[u]) {
        if (dist[u] + w < dist[v]) {
          const old = dist[v];
          dist[v] = dist[u] + w;
          pq.push([dist[v], v]);
          t.emit(11, `Relax ${u}→${v} (weight ${w}): ${old === Infinity ? "∞" : old} → ${dist[v]}. Better route found.`, {
            graphEdges: edges,
            labels: L(),
            stack: pqStack(),
            compare: [u],
            edge: [u, v],
          });
        } else {
          t.emit(10, `Edge ${u}→${v} (weight ${w}): ${dist[u]} + ${w} ≥ ${dist[v]} — no improvement.`, {
            graphEdges: edges,
            labels: L(),
            stack: pqStack(),
            compare: [u],
            edge: [u, v],
          });
        }
      }
    }
    t.emit(16, "Queue drained — every label is the true cheapest cost from node 0.", {
      graphEdges: edges,
      labels: L(),
      stack: [],
    });
    return t.steps;
  },
};
