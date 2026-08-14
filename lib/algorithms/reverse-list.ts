import { Algorithm, Tracer } from "../trace";

export const reverseList: Algorithm = {
  id: "reverse",
  name: "Reverse a list",
  tagline: "Three pointers walk the list, flipping one arrow per step.",
  code: `function reverse(head: Node | null) {
  let prev: Node | null = null;
  let cur = head;
  while (cur !== null) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}`,
  facts: [
    { label: "time", value: "O(n)" },
    { label: "space", value: "O(1)" },
    { label: "pattern", value: "three pointers" },
    { label: "arrows flipped", value: "n, exactly" },
  ],
  intuition: [
    "Walk the list once, flipping each arrow to point backward. The trap: the moment you flip cur.next, you have lost your way forward — the rest of the list is unreachable. That is why next is saved first, every iteration, before the flip. Save, flip, advance: the three-line ritual.",
    "The invariant to say out loud: at the top of every iteration, everything before cur is already reversed (green, arrows pointing left) and prev is its head; everything from cur onward is still the original list. The two halves are disconnected — the saved next pointer is the only bridge, held in a local variable.",
    "This is the most-asked linked-list question in interviews, and the follow-ups are predictable: do it recursively (the recursive version uses O(n) stack space — say so), reverse only positions m to n (LeetCode 92 — same flip, plus careful stitching at both seams), and reverse in k-groups (hard). Master the three-pointer dance here and all of them are variations.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    const links: (number | null)[] = input.map((_, i) => (i < n - 1 ? i + 1 : null));
    let prev: number | null = null;
    let cur: number | null = 0;
    const L = () => [...links];
    const P = (extra: Record<string, number> = {}) => {
      const p: Record<string, number> = { ...extra };
      if (prev !== null) p.prev = prev;
      if (cur !== null) p.cur = cur;
      return p;
    };
    t.emit(3, "prev starts at ∅, cur at the head. One arrow will flip per iteration.", {
      links: L(),
      pointers: P(),
    });
    while (cur !== null) {
      const nxt: number | null = links[cur];
      t.emit(5, `Save cur.next ${nxt === null ? "— it is ∅, this is the tail" : `(node ${t.v(nxt)})`} before the flip destroys it.`, {
        links: L(),
        pointers: P(nxt !== null ? { next: nxt } : {}),
        compare: [cur],
      });
      links[cur] = prev;
      t.emit(6, `Flip: node ${t.v(cur)} now points ${prev === null ? "to ∅ — it becomes the new tail" : `back at node ${t.v(prev)}`}.`, {
        links: L(),
        pointers: P(nxt !== null ? { next: nxt } : {}),
        swap: [cur],
      });
      t.markSorted(cur);
      prev = cur;
      cur = nxt;
      t.emit(8, cur === null
        ? "Advance: cur steps onto ∅ — the walk is over."
        : `Advance: prev is now node ${t.v(prev)}, cur is node ${t.v(cur)}. Everything behind cur is reversed.`, {
        links: L(),
        pointers: P(),
      });
    }
    t.emit(10, `Return prev — node ${t.v(prev!)} is the new head. Every arrow flipped exactly once.`, {
      links: L(),
      pointers: { head: prev! },
      found: prev!,
    });
    return t.steps;
  },
};
