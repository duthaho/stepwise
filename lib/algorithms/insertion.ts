import { Algorithm, Tracer } from "../trace";

export const insertionSort: Algorithm = {
  id: "insertion",
  name: "Insertion sort",
  tagline: "Take the next element and slide it left into the sorted prefix.",
  code: `function insertionSort(a: number[]) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
  return a;
}`,
  complexity: {
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "yes",
  },
  intuition: [
    "Think of sorting a hand of cards: everything to your left is already ordered, and you insert the next card by sliding it leftward past every larger card. The prefix a[0..i−1] is always sorted — that invariant is the whole algorithm.",
    "Insertion sort is adaptive: on a nearly-sorted array the while-loop barely runs, giving O(n + d) where d is the number of inversions. This is why it appears inside real sorts — Timsort and most quicksort implementations hand small or nearly-sorted runs to insertion sort. Try the “Nearly sorted” preset and watch how little work it does.",
    "The animation shows the key physically sliding left past each larger element — the code expresses the same movement as shifts (copy right, place once), which touches fewer memory cells.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    t.emit(2, `a[0]=${t.v(0)} alone is a sorted prefix of length 1.`);
    t.markSorted(0);
    for (let i = 1; i < n; i++) {
      const keyVal = t.v(i);
      let pos = i;
      t.emit(3, `Take a[${i}]=${keyVal} as the key to insert.`, { key: pos });
      let j = i - 1;
      for (;;) {
        if (j < 0) {
          t.emit(5, `Reached the left edge — nothing smaller remains.`, {
            key: pos,
          });
          break;
        }
        const left = t.v(j);
        t.emit(5, `Is a[${j}]=${left} > key ${keyVal}?`, {
          compare: [j],
          key: pos,
        });
        if (left > keyVal) {
          t.swap(j, pos);
          pos = j;
          t.emit(6, `Yes — ${left} shifts right, key slides to index ${pos}.`, {
            swap: [pos, pos + 1],
            key: pos,
          });
          j--;
        } else {
          t.emit(5, `No — ${left} ≤ ${keyVal}, the slot is found.`, {
            compare: [j],
            key: pos,
          });
          break;
        }
      }
      t.markSorted(i);
      t.emit(9, `Key ${keyVal} settles at index ${pos}. Prefix a[0..${i}] is sorted.`, {
        key: pos,
      });
    }
    t.markAllSorted();
    t.emit(11, "Prefix covers the whole array. Sorted.");
    return t.steps;
  },
};
