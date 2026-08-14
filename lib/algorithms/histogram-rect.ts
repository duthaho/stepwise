import { Algorithm, Tracer } from "../trace";

export const histogramRect: Algorithm = {
  id: "histogram",
  name: "Largest rectangle",
  tagline: "Every bar wants to know how far its height can stretch.",
  stackLabel: "stack · bottom → top",
  code: `function largestRectangle(h: number[]) {
  const stack: number[] = []; // indices, heights increasing
  let best = 0;
  for (let i = 0; i <= h.length; i++) {
    const cur = i < h.length ? h[i] : 0;
    while (stack.length && h[stack.at(-1)!] > cur) {
      const top = stack.pop()!;
      const left = stack.length ? stack.at(-1)! + 1 : 0;
      best = Math.max(best, h[top] * (i - left));
    }
    stack.push(i);
  }
  return best;
}`,
  facts: [
    { label: "time", value: "O(n)" },
    { label: "space", value: "O(n)" },
    { label: "pattern", value: "monotonic stack" },
    { label: "difficulty", value: "the boss fight" },
  ],
  intuition: [
    "Find the largest rectangle that fits under the histogram. The reframe that cracks it: for each bar, imagine the widest rectangle whose height is that bar's height — it extends left and right until a shorter bar blocks it. Compute that for every bar and take the max. The monotonic stack finds both boundaries for all bars in one pass.",
    "Keep a stack of indices with increasing heights. When the incoming bar is shorter than the stack's top, the top's reign ends: the incoming bar is its right boundary, and the element beneath it on the stack is just past its left boundary — so its full rectangle is now known. Pop it, compute height × width, and repeat while the top is still taller. The dashed overlay draws each candidate rectangle the moment it is evaluated.",
    "Two details everyone misses the first time: the sentinel (i = n acts as a virtual bar of height 0, flushing every remaining bar out of the stack — otherwise ascending histograms never resolve), and the width formula i − left when the stack empties — an popped bar with nothing beneath it stretches all the way to index 0. This is LeetCode 84; its follow-up “maximal rectangle in a binary matrix” is this exact algorithm run once per row.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    const stack: number[] = [];
    let best = 0;
    let bestRect: { from: number; to: number; height: number } | null = null;
    t.emit(2, "Find the largest rectangle under the skyline. The stack keeps indices with increasing heights.", {
      stack: [],
    });
    for (let i = 0; i <= n; i++) {
      const cur = i < n ? t.v(i) : 0;
      if (i < n) {
        t.emit(5, `Bar ${i} has height ${cur}.`, { compare: [i], stack: [...stack] });
      } else {
        t.emit(5, "End of the histogram — a virtual bar of height 0 flushes the stack.", {
          stack: [...stack],
        });
      }
      while (stack.length && t.v(stack[stack.length - 1]) > cur) {
        const top = stack.pop()!;
        const left = stack.length ? stack[stack.length - 1] + 1 : 0;
        const width = i - left;
        const area = t.v(top) * width;
        const rect = { from: left, to: i - 1, height: t.v(top) };
        const isBest = area > best;
        if (isBest) {
          best = area;
          bestRect = rect;
        }
        t.emit(9, `Pop index ${top}: height ${t.v(top)} spans [${left}..${i - 1}] — area ${t.v(top)} × ${width} = ${area}${isBest ? ". New best!" : ` (best stays ${best}).`}`, {
          stack: [...stack],
          area: rect,
          ...(i < n ? { compare: [i] } : {}),
        });
      }
      if (i < n) {
        stack.push(i);
        t.emit(11, `Push index ${i} — heights on the stack stay increasing.`, {
          compare: [i],
          stack: [...stack],
        });
      }
    }
    t.emit(13, `Largest rectangle: area ${best}.`, {
      stack: [],
      ...(bestRect ? { area: bestRect } : {}),
    });
    return t.steps;
  },
};
