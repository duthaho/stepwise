import { Algorithm, Tracer } from "../trace";

export const windowMax: Algorithm = {
  id: "window-max",
  name: "Sliding window max",
  tagline: "A monotonic deque keeps the window's max at its front, always.",
  stackLabel: "deque · front → back",
  param: { label: "k", min: 2, max: 8, default: 3 },
  code: `function windowMax(a: number[], k: number) {
  const res: number[] = [];
  const dq: number[] = []; // indices, values decreasing
  for (let i = 0; i < a.length; i++) {
    if (dq.length && dq[0] <= i - k) dq.shift();
    while (dq.length && a[dq.at(-1)!] <= a[i]) dq.pop();
    dq.push(i);
    if (i >= k - 1) res.push(a[dq[0]]);
  }
  return res;
}`,
  facts: [
    { label: "time", value: "O(n)" },
    { label: "space", value: "O(k)" },
    { label: "pattern", value: "monotonic deque" },
    { label: "answers", value: "n − k + 1 windows" },
  ],
  intuition: [
    "Slide a window of size k across the array and report each window's maximum. The naive rescan costs O(n·k). The deque does it in O(n) with one idea: if a newer element is ≥ an older one, the older one can never be any future window's max — the newer element outlives it and dominates it. So pop dominated elements from the back before pushing.",
    "Two ends, two jobs: the back eats dominated elements as new ones arrive; the front expires elements that slide out of the window (that is the shift on line 5). What survives is a deque whose values strictly decrease front to back — so the answer to every window is simply whatever sits at the front, read off in O(1). Watch the chip strip: it only ever shrinks from both ends and grows at the back.",
    "Same amortized argument as the monotonic stack: every index enters the deque once and leaves at most once, so all n windows together cost O(n). This is the tool for “max/min over a sliding range” — and its 2D version (deque per row, then per column) is a classic hard follow-up. Try k at both extremes: k = 2 barely uses the deque; k = 8 shows long reigns at the front.",
  ],
  trace(input, k = 3) {
    const t = new Tracer(input);
    const n = t.arr.length;
    const kk = Math.max(2, Math.min(Math.round(k), n));
    const dq: number[] = [];
    t.emit(3, `Window size k = ${kk}. Deque values stay decreasing — the front is always the current window's max.`, {
      stack: [],
    });
    for (let i = 0; i < n; i++) {
      const lo = Math.max(0, i - kk + 1);
      if (dq.length && dq[0] <= i - kk) {
        const gone = dq[0];
        dq.shift();
        t.emit(5, `Index ${gone} (value ${t.v(gone)}) slid out of the window — drop it from the front.`, {
          stack: [...dq],
          range: [lo, i],
        });
      }
      while (dq.length && t.v(dq[dq.length - 1]) <= t.v(i)) {
        const top = dq[dq.length - 1];
        t.emit(6, `a[${top}] = ${t.v(top)} ≤ a[${i}] = ${t.v(i)} — dominated forever; pop it from the back.`, {
          compare: [i],
          key: top,
          stack: [...dq],
          range: [lo, i],
        });
        dq.pop();
      }
      dq.push(i);
      t.emit(7, `Push index ${i}. Deque values: [${dq.map((x) => t.v(x)).join(", ")}].`, {
        compare: [i],
        stack: [...dq],
        range: [lo, i],
      });
      if (i >= kk - 1) {
        t.emit(8, `Window [${lo}..${i}] max = a[${dq[0]}] = ${t.v(dq[0])} — read off the front in O(1).`, {
          found: dq[0],
          stack: [...dq],
          range: [lo, i],
        });
      }
    }
    t.emit(10, `Each index entered and left the deque at most once — O(n) for all ${n - kk + 1} windows.`, {
      stack: [...dq],
    });
    return t.steps;
  },
};
