import { Algorithm, Tracer } from "../trace";
import { buildBst } from "./bst-build";

export const bstSearch: Algorithm = {
  id: "bst-search",
  name: "BST search",
  tagline: "Binary search, but the structure is pointers instead of indices.",
  usesTarget: true,
  code: `function search(root: Node | null, target: number) {
  let cur = root;
  while (cur !== null) {
    if (target === cur.val) return cur;
    cur = target < cur.val ? cur.left : cur.right;
  }
  return null;
}`,
  facts: [
    { label: "average", value: "O(log n)" },
    { label: "worst", value: "O(n)" },
    { label: "space", value: "O(1)" },
    { label: "probes", value: "≤ tree height + 1" },
  ],
  intuition: [
    "Searching a BST is binary search wearing a different costume: every comparison discards an entire subtree, the same way binary search discards half an array. The difference is what carries the structure — an array's sortedness lives in its indices; a BST's lives in its pointers, which is what lets it also insert and delete in O(log n) without shifting anything.",
    "The cost is exactly the length of one root-to-leaf path, so everything depends on the height. A bushy tree gives O(log n) probes; a degenerate chain gives O(n) — search the largest value in a tree built from sorted inserts and you will walk every node. The array version never degrades this way, which is the honest trade-off between the two.",
    "Absence has a shape here too: the search does not scan and give up, it walks to precisely the null slot where the target would live if it existed — the same hole insert would fill. Try “pick missing” and watch the walk end at that null. That equivalence (search-miss position = insert position) is worth saying in an interview.",
  ],
  trace(input, target = input[0]) {
    const t = new Tracer(input);
    const { root, left, right } = buildBst(t);
    const T = () => ({ root, left: [...left], right: [...right] });
    let cur = root;
    let probes = 0;
    t.emit(2, `Search for ${target}, starting at the root. Each probe discards a whole subtree.`, {
      tree: T(),
      ...(cur !== null ? { compare: [cur] } : {}),
    });
    while (cur !== null) {
      probes++;
      if (target === t.v(cur)) {
        t.emit(4, `Node ${t.v(cur)} = ${target} — found in ${probes} ${probes === 1 ? "probe" : "probes"}.`, {
          tree: T(),
          found: cur,
        });
        return t.steps;
      }
      const goLeft = target < t.v(cur);
      const next = goLeft ? left[cur] : right[cur];
      t.emit(5, `${target} ${goLeft ? "<" : ">"} ${t.v(cur)} — the ${goLeft ? "right" : "left"} subtree cannot contain it. Go ${goLeft ? "left" : "right"}.`, {
        tree: T(),
        compare: [cur],
        ...(next !== null ? { key: next } : {}),
      });
      cur = next;
    }
    t.emit(7, `Walked to a null slot after ${probes} probes — ${target} is not in the tree. This is exactly where insert would put it.`, {
      tree: T(),
    });
    return t.steps;
  },
};
