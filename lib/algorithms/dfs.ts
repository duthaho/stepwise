import { Algorithm, Tracer } from "../trace";
import { buildGraph } from "../graph";

export const dfs: Algorithm = {
  id: "dfs",
  name: "Depth-first search",
  tagline: "Commit to one path until it dead-ends, then backtrack.",
  stackLabel: "stack · bottom → top",
  code: `function dfs(adj: number[][], start: number) {
  const seen = new Set([start]);
  const stack = [start];
  const order: number[] = [];
  while (stack.length > 0) {
    const u = stack.pop()!;
    order.push(u);
    for (const v of adj[u]) {
      if (!seen.has(v)) {
        seen.add(v);
        stack.push(v);
      }
    }
  }
  return order;
}`,
  facts: [
    { label: "time", value: "O(V + E)" },
    { label: "space", value: "O(V)" },
    { label: "finds", value: "reachability, components" },
    { label: "frontier", value: "LIFO stack" },
  ],
  intuition: [
    "One character difference from BFS — pop from the top instead of shifting from the front — and the personality flips completely. The stack always continues from the most recently discovered node, so DFS plunges down a single path as far as it can go, then backtracks to the last fork. The visit-order labels show the plunge: they run deep before they run wide.",
    "DFS makes no shortest-path promise; what it buys instead is structure. It is the engine behind connected components (flood fill), cycle detection in directed graphs (a node revisited while still “in progress”), topological sort (the reverse of the finish order), and maze generation and solving. When the question is “can I reach it / is it connected / in what dependency order”, think DFS.",
    "The recursive version is the same algorithm with the call stack doing the bookkeeping — cleaner to write, but it can blow the stack on deep graphs, and interviewers like hearing you say so. One subtlety of this iterative form: neighbours pushed last pop first, so it explores them in reverse adjacency order — a fine answer, but know it differs from the recursive visit order.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    const { edges, adj } = buildGraph(input);
    const E = edges.map(([u, v]) => [u, v] as [number, number]);
    const seen = new Set([0]);
    const stack = [0];
    const order: number[] = [];
    const visitNo: (string | null)[] = Array.from({ length: n }, () => null);
    t.emit(3, "Start at node 0. The stack means: always continue from the newest discovery.", {
      graphEdges: E,
      labels: [...visitNo],
      stack: [...stack],
    });
    while (stack.length > 0) {
      const u = stack.pop()!;
      order.push(u);
      visitNo[u] = `#${order.length}`;
      t.markSorted(u);
      t.emit(6, `Pop node ${u} — visit #${order.length}. Push its unseen neighbours.`, {
        graphEdges: E,
        labels: [...visitNo],
        stack: [...stack],
        compare: [u],
      });
      for (const [v] of adj[u]) {
        if (!seen.has(v)) {
          seen.add(v);
          stack.push(v);
          t.emit(11, `Node ${v} is new — mark seen, push it. It will be explored before anything older.`, {
            graphEdges: E,
            labels: [...visitNo],
            stack: [...stack],
            compare: [u],
            edge: [u, v],
          });
        }
      }
    }
    t.emit(15, `Stack empty — visit order: ${order.join(" → ")}. Deep first, wide later.`, {
      graphEdges: E,
      labels: [...visitNo],
      stack: [],
    });
    return t.steps;
  },
};
