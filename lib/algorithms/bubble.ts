import { Algorithm, Tracer } from "../trace";

export const bubbleSort: Algorithm = {
  id: "bubble",
  name: "Bubble sort",
  tagline: "Adjacent swaps push the largest value right on every pass.",
  code: `function bubbleSort(a: number[]) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return a;
}`,
  facts: [
    { label: "best", value: "O(n)" },
    { label: "average", value: "O(n²)" },
    { label: "worst", value: "O(n²)" },
    { label: "space", value: "O(1)" },
    { label: "stable", value: "yes" },
  ],
  intuition: [
    "Each pass walks the array comparing neighbours and swapping any pair that is out of order. After pass one, the largest element has bubbled to the last slot; after pass two, the second largest is in place — so every pass shrinks the unsorted region by one from the right.",
    "The swapped flag is the detail interviewers probe: if a full pass makes zero swaps, the array is already sorted and the loop exits early. That is what makes the best case O(n) instead of O(n²) — worth saying out loud before you are asked.",
    "In practice bubble sort is a teaching tool, not a production sort. Its value is that the invariant is visible: watch the green region grow from the right, one settled element per pass.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    t.emit(2, `Start with ${n} elements. Each pass bubbles the largest remaining value to the right.`);
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      t.emit(4, `Pass ${i + 1}: reset the swapped flag.`);
      for (let j = 0; j < n - 1 - i; j++) {
        const x = t.v(j);
        const y = t.v(j + 1);
        t.emit(6, `Compare a[${j}]=${x} with a[${j + 1}]=${y}.`, {
          compare: [j, j + 1],
        });
        if (x > y) {
          t.swap(j, j + 1);
          swapped = true;
          t.emit(7, `${x} > ${y} — out of order, swap them.`, {
            swap: [j, j + 1],
          });
        }
      }
      t.markSorted(n - 1 - i);
      if (!swapped) {
        t.markAllSorted();
        t.emit(11, `Pass ${i + 1} made no swaps — the array is already sorted. Stop early.`);
        break;
      }
      t.emit(10, `Pass ${i + 1} done — a[${n - 1 - i}]=${t.v(n - 1 - i)} is in its final place.`);
    }
    t.markAllSorted();
    t.emit(13, "Every element settled. Sorted.");
    return t.steps;
  },
};
