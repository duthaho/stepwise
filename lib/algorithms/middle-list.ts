import { Algorithm, Tracer } from "../trace";

export const middleList: Algorithm = {
  id: "middle",
  name: "Find the middle",
  tagline: "Fast moves two, slow moves one — when fast finishes, slow is halfway.",
  code: `function middle(head: Node | null) {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next!;
    fast = fast.next.next!;
  }
  return slow;
}`,
  facts: [
    { label: "time", value: "O(n)" },
    { label: "space", value: "O(1)" },
    { label: "pattern", value: "fast & slow runners" },
    { label: "passes", value: "one" },
  ],
  intuition: [
    "A linked list has no indices and no length — you cannot jump to n/2. The obvious fix is two passes: count, then walk halfway. The runner trick does it in one: send two pointers from the head, one moving a node per step, the other moving two. When the fast one runs off the end, the slow one is standing exactly in the middle.",
    "The loop guard is where the edge cases live: fast !== null handles even-length lists (fast steps off the end), fast.next !== null handles odd (fast lands on the tail). For even lengths this version returns the second of the two middles — the convention most problems want. If you need the first, start fast at head.next; being able to say that unprompted is the mark of having actually thought about it.",
    "The runner pattern generalizes hard: the same shape finds the k-th node from the end (give one runner a k head start), detects cycles (next tab), and splits a list for merge sort on linked lists. One pass, O(1) space, no length needed — that combination is why interviewers keep reaching for it.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    const links: (number | null)[] = input.map((_, i) => (i < n - 1 ? i + 1 : null));
    let slow = 0;
    let fast: number | null = 0;
    const P = () => {
      const p: Record<string, number> = { slow };
      if (fast !== null) p.fast = fast;
      return p;
    };
    t.emit(3, "Both runners start at the head.", { links: [...links], pointers: P() });
    let step = 0;
    while (fast !== null && links[fast] !== null) {
      step++;
      slow = links[slow]!;
      const fastNext: number = links[fast]!;
      fast = links[fastNext];
      t.emit(6, `Step ${step}: slow walks to node ${t.v(slow)}; fast leaps two ${fast === null ? "and runs off the end (∅)" : `to node ${t.v(fast)}`}.`, {
        links: [...links],
        pointers: P(),
        compare: fast !== null ? [slow, fast] : [slow],
      });
    }
    t.emit(8, `Fast is done — slow stands on node ${t.v(slow)}, the middle${n % 2 === 0 ? " (second of the two, for even length)" : ""}. Found in ${step} steps, no counting pass.`, {
      links: [...links],
      pointers: { slow },
      found: slow,
    });
    return t.steps;
  },
};
