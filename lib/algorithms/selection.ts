import { Algorithm, Tracer } from "../trace";

export const selectionSort: Algorithm = {
  id: "selection",
  name: "Selection sort",
  tagline: "Scan for the minimum, swap it into place, repeat.",
  code: `function selectionSort(a: number[]) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
    }
  }
  return a;
}`,
  complexity: {
    best: "O(n²)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "no",
  },
  intuition: [
    "Selection sort splits the array into a sorted prefix and an unsorted suffix. Each round it scans the whole suffix for the minimum, then makes exactly one swap to extend the prefix. The sorted region grows from the left, one guaranteed-correct element at a time.",
    "The signature property: at most n − 1 swaps total — the fewest of any comparison sort. When writes are expensive (flash memory, huge records) that matters. The cost is that comparisons never shrink: even a sorted input takes the full O(n²) scan, because the algorithm cannot know the minimum without looking at everything.",
    "Interview trap: selection sort is not stable. Swapping the minimum over a duplicate can reorder equal elements — a favourite follow-up question.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    t.emit(2, `Start with ${n} elements. Each round selects the minimum of the unsorted suffix.`);
    for (let i = 0; i < n - 1; i++) {
      let min = i;
      t.emit(4, `Round ${i + 1}: assume a[${i}]=${t.v(i)} is the minimum.`, {
        key: min,
      });
      for (let j = i + 1; j < n; j++) {
        t.emit(6, `Compare a[${j}]=${t.v(j)} with current min a[${min}]=${t.v(min)}.`, {
          compare: [j],
          key: min,
        });
        if (t.v(j) < t.v(min)) {
          min = j;
          t.emit(6, `New minimum: a[${j}]=${t.v(j)}.`, { key: min });
        }
      }
      if (min !== i) {
        const a = t.v(i);
        const b = t.v(min);
        t.swap(i, min);
        t.markSorted(i);
        t.emit(9, `Swap ${b} into index ${i} (was ${a}). Prefix grows.`, {
          swap: [i, min],
        });
      } else {
        t.markSorted(i);
        t.emit(8, `a[${i}]=${t.v(i)} is already the minimum — no swap needed.`, {
          key: i,
        });
      }
    }
    t.markAllSorted();
    t.emit(12, "Last element is the maximum by elimination. Sorted.");
    return t.steps;
  },
};
