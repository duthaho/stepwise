import { Algorithm, Tracer } from "../trace";

export const mergeSort: Algorithm = {
  id: "merge",
  name: "Merge sort",
  tagline: "Split to single elements, then merge sorted runs pairwise.",
  code: `function mergeSort(a: number[], lo = 0, hi = a.length - 1) {
  if (lo >= hi) return;
  const mid = (lo + hi) >> 1;
  mergeSort(a, lo, mid);
  mergeSort(a, mid + 1, hi);
  const merged: number[] = [];
  let i = lo, j = mid + 1;
  while (i <= mid && j <= hi) {
    if (a[i] <= a[j]) merged.push(a[i++]);
    else merged.push(a[j++]);
  }
  while (i <= mid) merged.push(a[i++]);
  while (j <= hi) merged.push(a[j++]);
  for (let k = 0; k < merged.length; k++) {
    a[lo + k] = merged[k];
  }
}`,
  facts: [
    { label: "best", value: "O(n log n)" },
    { label: "average", value: "O(n log n)" },
    { label: "worst", value: "O(n log n)" },
    { label: "space", value: "O(n)" },
    { label: "stable", value: "yes" },
  ],
  intuition: [
    "Divide until every window holds one element — a single element is trivially sorted. Then merge sorted runs pairwise: since both runs are sorted, the smallest remaining element is always at the front of one of them, so one linear pass zips them into a bigger sorted run. log n levels of merging, linear work per level: O(n log n) — guaranteed, on every input.",
    "The ≤ in the comparison is what makes it stable: on a tie the left run's element goes first, preserving original order of equal keys. Try the “Few unique” preset and watch ties resolve left-first. That guarantee is why mergesort variants (Timsort) back the standard sort in Python and Java for objects.",
    "The code merges through an auxiliary array — that O(n) extra space is the classic trade-off against quicksort's in-place partitioning. The animation shows the same stable interleave as movement: when the right run's front wins, it slides left into the merge boundary. Interview follow-ups to have ready: merging two sorted linked lists needs O(1) extra space, and merge sort is the algorithm of external sorting — merging runs too big for memory.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    if (n === 1) {
      t.markAllSorted();
      t.emit(2, "One element — already sorted.");
      return t.steps;
    }
    const go = (lo: number, hi: number) => {
      if (lo >= hi) {
        t.emit(2, `Window [${lo}..${hi}] has one element — a run by itself.`, {
          range: [lo, hi],
        });
        return;
      }
      const mid = (lo + hi) >> 1;
      t.emit(3, `Split [${lo}..${hi}] into [${lo}..${mid}] and [${mid + 1}..${hi}].`, {
        range: [lo, hi],
      });
      go(lo, mid);
      go(mid + 1, hi);

      // Merge, shown as a stable in-place interleave: b is the merge
      // boundary, m the (shifting) end of the left run, j the right run's
      // front. Same comparisons and result as the aux-array code.
      let b = lo;
      let m = mid;
      let j = mid + 1;
      const isFinal = lo === 0 && hi === n - 1;
      t.emit(7, `Merge runs [${lo}..${mid}] and [${mid + 1}..${hi}].`, {
        range: [lo, hi],
        key: b,
      });
      while (b <= m && j <= hi) {
        const left = t.v(b);
        const right = t.v(j);
        t.emit(9, `Compare left ${left} with right ${right}.`, {
          compare: [b, j],
          range: [lo, hi],
        });
        if (left <= right) {
          if (isFinal) t.markSorted(b);
          t.emit(9, `${left} ≤ ${right} — left front is next; it is already in place.`, {
            key: b,
            range: [lo, hi],
          });
          b++;
        } else {
          t.move(j, b);
          if (isFinal) t.markSorted(b);
          t.emit(10, `${right} < ${left} — ${right} slides in at index ${b}.`, {
            swap: [b],
            range: [lo, hi],
          });
          b++;
          m++;
          j++;
        }
      }
      if (j <= hi) {
        if (isFinal) for (let k = j; k <= hi; k++) t.markSorted(k);
        t.emit(13, "Left run exhausted — the right remainder is already in place.", {
          range: [lo, hi],
        });
      } else if (b <= m) {
        if (isFinal) for (let k = b; k <= m; k++) t.markSorted(k);
        t.emit(12, "Right run exhausted — the left remainder is already in place.", {
          range: [lo, hi],
        });
      }
      t.emit(15, `Window [${lo}..${hi}] is now one sorted run.`, {
        range: [lo, hi],
      });
    };
    go(0, n - 1);
    t.markAllSorted();
    t.emit(17, "Runs merged all the way up. Sorted.");
    return t.steps;
  },
};
