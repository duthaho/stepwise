import { Algorithm, Tracer } from "../trace";

export const lowerBound: Algorithm = {
  id: "lower-bound",
  name: "Lower bound",
  tagline: "Find the first element ≥ target — even when it isn't there.",
  code: `function lowerBound(a: number[], target: number) {
  let lo = 0, hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}`,
  facts: [
    { label: "best", value: "O(log n)" },
    { label: "average", value: "O(log n)" },
    { label: "worst", value: "O(log n)" },
    { label: "space", value: "O(1)" },
    { label: "returns", value: "insertion index" },
  ],
  intuition: [
    "Lower bound answers a better question than “is it there?” — it finds the first index whose element is ≥ target. That index is where the target lives if present (the leftmost copy, when there are duplicates), and where it would be inserted if absent. This is C++'s lower_bound and Python's bisect_left, and it is the version of binary search worth memorizing.",
    "The half-open window [lo, hi) is the discipline: everything left of lo is known < target, everything from hi onward is known ≥ target. Note what is different from plain binary search: hi starts at n (one past the end — the answer might be “insert after everything”), the loop runs while lo < hi, and hi moves to mid, not mid − 1 — mid itself might be the answer, so it stays in the window. When lo meets hi the two known zones touch, and that meeting point is the answer. No equality check anywhere in the loop.",
    "This shape generalizes into the “binary search on the answer” pattern: any predicate that flips once from false to true — “can we ship all packages with capacity c?”, “is this speed enough?” — can be searched the same way. Interviewers reach for it constantly. Try a target with duplicates (the “duplicates” preset) and confirm it lands on the leftmost copy.",
  ],
  trace(input, target = input[0]) {
    const t = new Tracer(input);
    const n = t.arr.length;
    let lo = 0;
    let hi = n;
    t.emit(2, `Find the first element ≥ ${target}. Window is half-open: [${lo}, ${hi}) — hi starts one past the end.`, {
      pointers: { lo, hi },
      range: [lo, hi - 1],
    });
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      const v = t.v(mid);
      t.emit(4, `mid = (${lo} + ${hi}) >> 1 = ${mid}, a[${mid}] = ${v}.`, {
        pointers: { lo, mid, hi },
        compare: [mid],
        range: [lo, hi - 1],
      });
      if (v < target) {
        lo = mid + 1;
        t.emit(5, `${v} < ${target} — everything up to mid is too small. lo jumps to ${lo}.`, {
          pointers: { lo, hi },
          range: [lo, hi - 1],
        });
      } else {
        hi = mid;
        t.emit(6, `${v} ≥ ${target} — mid could be the answer, so it stays in the window. hi moves to ${hi}.`, {
          pointers: { lo, hi },
          range: [lo, hi - 1],
        });
      }
    }
    if (lo < n) {
      t.emit(8, `lo met hi at ${lo}: a[${lo}] = ${t.v(lo)} is the first element ≥ ${target}${t.v(lo) === target ? " — the leftmost copy of the target" : ""}. Insertion index: ${lo}.`, {
        found: lo,
        pointers: { lo },
      });
    } else {
      t.emit(8, `lo met hi at ${lo} = n: every element is < ${target}. It would be inserted at the very end.`, {
        pointers: { lo },
        range: [0, -1],
      });
    }
    return t.steps;
  },
};
