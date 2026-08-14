import { Algorithm, Tracer } from "../trace";
import { buildBst } from "./bst-build";

export const inorderTraversal: Algorithm = {
  id: "inorder",
  name: "In-order traversal",
  tagline: "Left, node, right — and a sorted sequence falls out.",
  stackLabel: "output",
  code: `function inorder(root: Node | null, out: number[] = []) {
  if (root === null) return out;
  inorder(root.left, out);
  out.push(root.val);
  inorder(root.right, out);
  return out;
}`,
  facts: [
    { label: "time", value: "O(n)" },
    { label: "space", value: "O(h) recursion" },
    { label: "output", value: "sorted ascending" },
    { label: "variants", value: "pre / post / level" },
  ],
  intuition: [
    "In-order means: everything smaller first (the whole left subtree), then me, then everything larger (the right subtree). Apply that rule recursively at every node and the output is the values in sorted order — the BST invariant, converted from a structural promise into a sequence. Watch the output strip: it only ever grows in ascending order.",
    "This is the standard tool for “validate a BST” (traverse; check the output is strictly increasing — or better, pass down min/max bounds), “k-th smallest element” (stop after k visits), and “BST to sorted list”. If a problem says BST and order, in-order is almost always the move.",
    "Know the family: pre-order (node first — serializes a tree so it can be rebuilt), post-order (children first — safe deletion, computing subtree sizes), level-order (BFS with a queue). And the recursion uses O(h) stack — an interviewer may ask for the iterative version with an explicit stack, which is the same walk with the call stack made visible.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const { root, left, right } = buildBst(t);
    const T = () => ({ root, left: [...left], right: [...right] });
    const out: number[] = [];
    t.emit(1, "Traverse: left subtree, then the node, then the right subtree — recursively.", {
      tree: T(),
      stack: [],
    });
    const go = (node: number | null) => {
      if (node === null) return;
      if (left[node] !== null) {
        t.emit(3, `At ${t.v(node)}: smaller values exist — descend left first.`, {
          tree: T(),
          compare: [node],
          stack: [...out],
        });
        go(left[node]);
      }
      out.push(node);
      t.markSorted(node);
      t.emit(4, `Visit ${t.v(node)} — everything smaller is already out. Output: [${out.map((x) => t.v(x)).join(", ")}].`, {
        tree: T(),
        found: node,
        stack: [...out],
      });
      if (right[node] !== null) {
        t.emit(5, `At ${t.v(node)}: now the larger side — descend right.`, {
          tree: T(),
          compare: [node],
          stack: [...out],
        });
        go(right[node]);
      }
    };
    go(root);
    t.emit(6, "Done — the output is sorted ascending. That is the BST invariant, flattened.", {
      tree: T(),
      stack: [...out],
    });
    return t.steps;
  },
};
