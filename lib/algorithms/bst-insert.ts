import { Algorithm, Tracer } from "../trace";

export const bstInsert: Algorithm = {
  id: "bst-insert",
  name: "BST insert",
  tagline: "Every comparison sends you left or right — the shape is the history.",
  stackLabel: "to insert",
  code: `function insert(root: Node | null, v: number): Node {
  if (root === null) return new Node(v);
  if (v < root.val) {
    root.left = insert(root.left, v);
  } else if (v > root.val) {
    root.right = insert(root.right, v);
  }
  return root; // duplicates: ignored
}`,
  facts: [
    { label: "average", value: "O(log n)" },
    { label: "worst", value: "O(n)" },
    { label: "space", value: "O(h) recursion" },
    { label: "invariant", value: "left < node < right" },
  ],
  intuition: [
    "A binary search tree keeps one promise everywhere: everything in a node's left subtree is smaller, everything right is larger. Insertion just follows the promise — compare, go left or right, repeat until you fall off the tree, and that hole is where the new node belongs. No rebalancing, no shifting: one node pointer changes.",
    "The tree's shape is the insertion history. Values arriving in shuffled order build a bushy tree of height ≈ log n; the same values arriving sorted build a chain — every insert goes right, and the “tree” degenerates into a linked list with O(n) operations. Watch it happen: set the values yourself in increasing order and the tree falls over sideways.",
    "That degenerate case is why balanced trees exist (AVL, red-black) — same invariant, plus rotations that cap the height at O(log n). In interviews you rarely implement rotations, but you are expected to know why the worst case is O(n) and what fixes it. Note the duplicate policy too: this version ignores them; alternatives count occurrences or lean right — say which you chose.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    const left: (number | null)[] = input.map(() => null);
    const right: (number | null)[] = input.map(() => null);
    let root: number | null = null;
    const T = () => ({ root, left: [...left], right: [...right] });
    const pending = (from: number) =>
      Array.from({ length: n - from }, (_, k) => from + k);

    t.emit(1, `Insert ${n} values, in arrival order. The first becomes the root.`, {
      tree: T(),
      stack: pending(0),
    });
    for (let i = 0; i < n; i++) {
      const v = t.v(i);
      if (root === null) {
        root = i;
        t.emit(2, `Tree is empty — ${v} becomes the root.`, {
          tree: T(),
          found: i,
          stack: pending(i + 1),
        });
        continue;
      }
      let cur = root;
      for (;;) {
        if (v === t.v(cur)) {
          t.emit(8, `${v} equals node ${t.v(cur)} — duplicate, ignored.`, {
            tree: T(),
            compare: [cur],
            stack: pending(i + 1),
          });
          break;
        }
        const goLeft = v < t.v(cur);
        const next = goLeft ? left[cur] : right[cur];
        t.emit(goLeft ? 3 : 5, `${v} ${goLeft ? "<" : ">"} ${t.v(cur)} — go ${goLeft ? "left" : "right"}.`, {
          tree: T(),
          compare: [cur],
          key: i,
          stack: pending(i + 1),
        });
        if (next === null) {
          if (goLeft) left[cur] = i;
          else right[cur] = i;
          t.emit(2, `Fell off the tree — ${v} hangs as the ${goLeft ? "left" : "right"} child of ${t.v(cur)}.`, {
            tree: T(),
            found: i,
            stack: pending(i + 1),
          });
          break;
        }
        cur = next;
      }
    }
    t.markAllSorted();
    t.emit(8, "All values placed. Every path from the root follows the compare-and-descend rule.", {
      tree: T(),
      stack: [],
    });
    return t.steps;
  },
};
