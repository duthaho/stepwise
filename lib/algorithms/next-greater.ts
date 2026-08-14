import { Algorithm, Tracer } from "../trace";

export const nextGreater: Algorithm = {
  id: "next-greater",
  name: "Next greater element",
  tagline: "A stack of values still waiting for something bigger.",
  stackLabel: "stack · bottom → top",
  code: `function nextGreater(a: number[]) {
  const res = new Array(a.length).fill(-1);
  const stack: number[] = [];
  for (let i = 0; i < a.length; i++) {
    while (stack.length && a[stack.at(-1)!] < a[i]) {
      res[stack.pop()!] = a[i];
    }
    stack.push(i);
  }
  return res;
}`,
  facts: [
    { label: "time", value: "O(n)" },
    { label: "space", value: "O(n)" },
    { label: "pattern", value: "monotonic stack" },
    { label: "stack ops", value: "≤ 2n total" },
  ],
  intuition: [
    "For every element, find the first element to its right that is larger. Brute force checks every pair — O(n²). The stack version scans once: each index waits on the stack until a bigger value arrives, and the moment it does, the wait is over — pop and record the answer. Elements still on the stack at the end never met anything bigger; they keep −1.",
    "The magic invariant: values on the stack never increase from bottom to top (equal values wait together — only a strictly greater arrival resolves them). Why? Anything smaller than the incoming value gets popped before the push. So the stack is exactly the set of elements whose answer is still unknown, ordered by when they will give up. Watch the chip strip — it never violates the ordering.",
    "The complexity argument interviewers want to hear: each index is pushed once and popped at most once, so the whole scan is ≤ 2n stack operations — O(n) amortized, even though a single step can pop many times. This pattern (daily temperatures, stock span, next smaller element) is one of the most reused templates in interviews — recognize “nearest larger/smaller to the left/right” and reach for it.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    const stack: number[] = [];
    t.emit(3, "Scan left to right. The stack holds indices still waiting for a greater element.", {
      stack: [],
    });
    for (let i = 0; i < n; i++) {
      while (stack.length && t.v(stack[stack.length - 1]) < t.v(i)) {
        const top = stack[stack.length - 1];
        t.emit(5, `a[${top}] = ${t.v(top)} < a[${i}] = ${t.v(i)} — the wait is over.`, {
          compare: [i],
          key: top,
          stack: [...stack],
        });
        stack.pop();
        t.markSorted(top);
        t.emit(6, `Pop index ${top}: next greater of ${t.v(top)} is ${t.v(i)}. Resolved.`, {
          compare: [i],
          stack: [...stack],
        });
      }
      if (stack.length) {
        const top = stack[stack.length - 1];
        t.emit(5, `a[${top}] = ${t.v(top)} ≥ a[${i}] = ${t.v(i)} — still waiting; stop popping.`, {
          compare: [i],
          key: top,
          stack: [...stack],
        });
      }
      stack.push(i);
      t.emit(8, `Push index ${i}. Stack values never increase, bottom to top: [${stack.map((x) => t.v(x)).join(", ")}].`, {
        stack: [...stack],
      });
    }
    for (const idx of stack) t.markSorted(idx);
    t.emit(10, `Scan done. ${stack.length} ${stack.length === 1 ? "index" : "indices"} never met a greater value — their answer stays −1.`, {
      stack: [...stack],
    });
    return t.steps;
  },
};
