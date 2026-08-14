import { Tracer } from "../trace";

/** Build a BST from the tracer's cells in arrival order, without emitting steps. */
export function buildBst(t: Tracer): {
  root: number | null;
  left: (number | null)[];
  right: (number | null)[];
} {
  const n = t.arr.length;
  const left: (number | null)[] = Array.from({ length: n }, () => null);
  const right: (number | null)[] = Array.from({ length: n }, () => null);
  let root: number | null = null;
  for (let i = 0; i < n; i++) {
    if (root === null) {
      root = i;
      continue;
    }
    let cur = root;
    for (;;) {
      if (t.v(i) === t.v(cur)) break; // ignore duplicates
      const goLeft = t.v(i) < t.v(cur);
      const next = goLeft ? left[cur] : right[cur];
      if (next === null) {
        if (goLeft) left[cur] = i;
        else right[cur] = i;
        break;
      }
      cur = next;
    }
  }
  return { root, left, right };
}
