import { Algorithm, Tracer } from "../trace";

export const cycleDetect: Algorithm = {
  id: "cycle",
  name: "Detect a cycle",
  tagline: "If the track loops, the fast runner must lap the slow one.",
  param: { label: "cycle @", min: -1, max: 23, default: 3 },
  code: `function hasCycle(head: Node | null) {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next!;
    fast = fast.next.next!;
    if (slow === fast) return true;
  }
  return false;
}`,
  facts: [
    { label: "time", value: "O(n)" },
    { label: "space", value: "O(1)" },
    { label: "pattern", value: "Floyd's tortoise & hare" },
    { label: "vs hash set", value: "O(n) space saved" },
  ],
  intuition: [
    "Does the list ever loop back on itself? A hash set of visited nodes answers it in O(n) space. Floyd's answer costs nothing: two runners, one fast, one slow. On a straight track the fast one simply falls off the end — no cycle. On a looped track the fast runner enters the cycle, circles, and closes in on the slow one from behind.",
    "The gap argument is the part to be able to prove: once both runners are inside the cycle, every step the fast runner gains exactly one node on the slow one. A gap that shrinks by one per step must hit zero — they meet, and they meet within one lap. Watch the narration count the gap down; that is the proof, animated.",
    "Use the “cycle @” slider: −1 makes the list straight (fast runs off the end), other values choose where the tail loops back to. The classic follow-up is LeetCode 142 — after the runners meet, reset one to the head and walk both one step at a time; where they meet again is the cycle's entry node. The algebra behind that (2d = d + kL) is worth working through once on paper.",
  ],
  trace(input, cycleAt = 3) {
    const t = new Tracer(input);
    const n = t.arr.length;
    const entry =
      cycleAt < 0 ? null : Math.min(Math.max(0, Math.round(cycleAt)), n - 1);
    const links: (number | null)[] = input.map((_, i) => (i < n - 1 ? i + 1 : null));
    if (entry !== null) links[n - 1] = entry;
    let slow: number | null = 0;
    let fast: number | null = 0;
    const P = () => {
      const p: Record<string, number> = {};
      if (slow !== null) p.slow = slow;
      if (fast !== null) p.fast = fast;
      return p;
    };
    t.emit(3, entry === null
      ? "Both runners start at the head. The list is straight — watch fast sprint off the end."
      : `Both runners start at the head. The tail loops back to node ${t.v(entry)} — the track is a circuit.`, {
      links: [...links],
      pointers: P(),
    });
    let step = 0;
    while (fast !== null && links[fast] !== null) {
      step++;
      slow = links[slow!]!;
      const fastNext: number | null = links[fast]!;
      fast = fastNext === null ? null : links[fastNext];
      if (fast === null) break;
      if (slow === fast) {
        t.emit(7, `Step ${step}: they collide on node ${t.v(slow)} — the gap hit zero. A meeting is only possible on a looped track: cycle detected.`, {
          links: [...links],
          pointers: { "slow·fast": slow },
          found: slow,
        });
        return t.steps;
      }
      t.emit(6, `Step ${step}: slow at node ${t.v(slow!)}, fast at node ${t.v(fast)} — still apart, keep running.`, {
        links: [...links],
        pointers: P(),
        compare: [slow!, fast],
      });
    }
    t.emit(9, `Fast ran off the end (∅) after ${step} ${step === 1 ? "step" : "steps"} — a looped track has no end, so this list has no cycle. Return false.`, {
      links: [...links],
      pointers: P(),
    });
    return t.steps;
  },
};
