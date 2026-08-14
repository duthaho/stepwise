import { Algorithm, Tracer } from "../trace";

export const quickSort: Algorithm = {
  id: "quick",
  name: "Quick sort",
  tagline: "Partition around a pivot; the pivot lands in its final slot.",
  code: `function quickSort(a: number[], lo = 0, hi = a.length - 1) {
  if (lo >= hi) return;
  const pivot = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (a[j] < pivot) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
  }
  [a[i], a[hi]] = [a[hi], a[i]];
  quickSort(a, lo, i - 1);
  quickSort(a, i + 1, hi);
}`,
  facts: [
    { label: "best", value: "O(n log n)" },
    { label: "average", value: "O(n log n)" },
    { label: "worst", value: "O(n²)" },
    { label: "space", value: "O(log n)" },
    { label: "stable", value: "no" },
  ],
  intuition: [
    "One partition pass does something permanent: every element smaller than the pivot ends up left of it, everything else right — so the pivot lands in its final sorted position and never moves again. Sorting reduces to two smaller independent problems on either side. Watch the dimmed bars: only the active window is ever touched.",
    "This is Lomuto partitioning: i is the boundary of the “smaller than pivot” zone, j scans ahead, and anything small gets swapped back into the zone. Interviewers often ask for Hoare’s scheme as a follow-up — fewer swaps, but the pivot does not land in final position.",
    "The worst case is the classic question: a sorted or reversed array with last-element pivots makes every partition maximally lopsided — O(n²). Try the “Reversed” preset and watch the windows shrink by one instead of halving. Real implementations pick random or median-of-three pivots to make that case vanishingly unlikely.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    if (n === 1) t.markSorted(0);
    t.emit(1, `Sort the window [0..${n - 1}] by recursive partitioning.`, {
      range: [0, n - 1],
    });
    const go = (lo: number, hi: number) => {
      if (lo >= hi) {
        if (lo === hi) {
          t.markSorted(lo);
          t.emit(2, `Window [${lo}..${hi}] has one element — already in place.`, {
            range: [lo, hi],
          });
        }
        return;
      }
      const pivotVal = t.v(hi);
      t.emit(3, `Partition [${lo}..${hi}] around pivot a[${hi}]=${pivotVal}.`, {
        pivot: hi,
        range: [lo, hi],
      });
      let i = lo;
      for (let j = lo; j < hi; j++) {
        t.emit(6, `Is a[${j}]=${t.v(j)} < pivot ${pivotVal}?`, {
          compare: [j],
          pivot: hi,
          range: [lo, hi],
        });
        if (t.v(j) < pivotVal) {
          if (i !== j) {
            const small = t.v(j);
            t.swap(i, j);
            t.emit(7, `Yes — swap ${small} into the small side at index ${i}.`, {
              swap: [i, j],
              pivot: hi,
              range: [lo, hi],
            });
          } else {
            t.emit(8, `Yes, and it is already at the boundary — just advance i.`, {
              compare: [j],
              pivot: hi,
              range: [lo, hi],
            });
          }
          i++;
        }
      }
      t.swap(i, hi);
      t.markSorted(i);
      t.emit(11, `Place pivot ${pivotVal} at index ${i} — its final position.`, {
        swap: [i, hi],
        range: [lo, hi],
      });
      go(lo, i - 1);
      go(i + 1, hi);
    };
    go(0, n - 1);
    t.markAllSorted();
    t.emit(13, "All windows resolved. Sorted.");
    return t.steps;
  },
};
