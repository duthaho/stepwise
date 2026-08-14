import { Algorithm, Tracer } from "../trace";
import { buildGraph } from "../graph";

export const bfs: Algorithm = {
  id: "bfs",
  name: "Breadth-first search",
  tagline: "The frontier expands one ring at a time — a queue makes it fair.",
  stackLabel: "queue · front → back",
  code: `function bfs(adj: number[][], start: number) {
  const dist = new Array(adj.length).fill(Infinity);
  dist[start] = 0;
  const queue = [start];
  while (queue.length > 0) {
    const u = queue.shift()!;
    for (const v of adj[u]) {
      if (dist[v] === Infinity) {
        dist[v] = dist[u] + 1;
        queue.push(v);
      }
    }
  }
  return dist;
}`,
  facts: [
    { label: "time", value: "O(V + E)" },
    { label: "space", value: "O(V)" },
    { label: "finds", value: "fewest-edge paths" },
    { label: "frontier", value: "FIFO queue" },
  ],
  intuition: [
    "BFS explores in rings: first everything one edge from the start, then everything two edges away, and so on. The queue is what enforces the fairness — nodes are processed in the order they were discovered, so no node at distance 3 is touched before every node at distance 2 is done. Watch the dist labels: they only ever come out in non-decreasing order.",
    "That ring discipline is the proof of BFS's headline guarantee: in an unweighted graph, the first time you reach a node is via a fewest-edges path. The moment a node gets a distance, it is final — no later discovery can beat it. This is why every “minimum number of moves/steps/transformations” problem (word ladder, knight moves, sliding puzzle) is secretly a BFS.",
    "The check that guards everything: only enqueue a node if it has never been seen (dist still ∞). Mark it seen when you enqueue, not when you dequeue — the classic bug is marking late, which lets the same node enter the queue twice. Swap the queue for a stack and this exact code becomes DFS; the data structure is the strategy.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    const { edges, adj } = buildGraph(input);
    const E = edges.map(([u, v]) => [u, v] as [number, number]);
    const dist: number[] = Array.from({ length: n }, () => Infinity);
    const L = () => dist.map((d) => (d === Infinity ? "∞" : String(d)));
    dist[0] = 0;
    const queue = [0];
    t.emit(4, "Start at node 0 with distance 0. Everyone else is ∞ — undiscovered.", {
      graphEdges: E,
      labels: L(),
      stack: [...queue],
    });
    while (queue.length > 0) {
      const u = queue.shift()!;
      t.emit(6, `Dequeue node ${u} (distance ${dist[u]}) — explore its neighbours.`, {
        graphEdges: E,
        labels: L(),
        stack: [...queue],
        compare: [u],
      });
      for (const [v] of adj[u]) {
        if (dist[v] === Infinity) {
          dist[v] = dist[u] + 1;
          queue.push(v);
          t.emit(9, `Node ${v} is new — distance ${dist[v]}, join the back of the queue.`, {
            graphEdges: E,
            labels: L(),
            stack: [...queue],
            compare: [u],
            edge: [u, v],
          });
        } else {
          t.emit(8, `Node ${v} was already discovered (distance ${dist[v]}) — skip.`, {
            graphEdges: E,
            labels: L(),
            stack: [...queue],
            compare: [u],
            edge: [u, v],
          });
        }
      }
      t.markSorted(u);
    }
    t.emit(14, "Queue empty — every reachable node has its fewest-edges distance.", {
      graphEdges: E,
      labels: L(),
      stack: [],
    });
    return t.steps;
  },
};
