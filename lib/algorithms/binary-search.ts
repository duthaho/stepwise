import { Algorithm, Tracer } from "../trace";

export const binarySearch: Algorithm = {
  id: "binary",
  name: "Binary search",
  tagline: "Sorted input lets one probe eliminate half the array.",
  code: `function binarySearch(a: number[], target: number) {
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] === target) return mid;
    if (a[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
  facts: [
    { label: "best", value: "O(1)" },
    { label: "average", value: "O(log n)" },
    { label: "worst", value: "O(log n)" },
    { label: "space", value: "O(1)" },
    { label: "requires", value: "sorted array" },
  ],
  intuition: [
    "The invariant is everything: if the target exists, it lives inside [lo..hi]. Because the array is sorted, comparing the middle element against the target tells you which half cannot contain it — so every probe throws away half the remaining candidates. Twelve elements need at most 4 probes; a billion need 30. Watch the dimmed region grow: that is the elimination happening.",
    "This is famously easy to describe and famously easy to get wrong — the first published version took years to be correct in all cases. The classic bugs interviewers watch for: `lo <= hi` vs `lo < hi` (off-by-one that skips the last candidate), moving to `mid` instead of `mid ± 1` (infinite loop on two elements), and in fixed-width languages `(lo + hi) / 2` overflowing — write `lo + (hi - lo) / 2` there. JavaScript's numbers dodge the overflow, but say the caveat anyway.",
    "Try a target that is not in the array and watch lo cross hi — the window empties, and that crossing is the proof of absence. Then try the same target on the linear search tab and compare probe counts.",
  ],
  trace(input, target = input[0]) {
    const t = new Tracer(input);
    const n = t.arr.length;
    let lo = 0;
    let hi = n - 1;
    let probes = 0;
    t.emit(2, `Search for ${target}. The candidate window is the whole array: [${lo}..${hi}].`, {
      pointers: { lo, hi },
      range: [lo, hi],
    });
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      probes++;
      const v = t.v(mid);
      t.emit(4, `Probe ${probes}: mid = (${lo} + ${hi}) >> 1 = ${mid}, a[${mid}] = ${v}.`, {
        pointers: { lo, mid, hi },
        compare: [mid],
        range: [lo, hi],
      });
      if (v === target) {
        t.emit(5, `a[${mid}] = ${target} — found it in ${probes} ${probes === 1 ? "probe" : "probes"} (linear search could take up to ${n}).`, {
          found: mid,
          pointers: { mid },
        });
        return t.steps;
      }
      if (v < target) {
        const gone = mid - lo + 1;
        lo = mid + 1;
        t.emit(6, `${v} < ${target} — the target must be right of mid. ${gone} ${gone === 1 ? "element" : "elements"} eliminated in one probe.`, {
          pointers: { lo, hi },
          range: [lo, hi],
        });
      } else {
        const gone = hi - mid + 1;
        hi = mid - 1;
        t.emit(7, `${v} > ${target} — the target must be left of mid. ${gone} ${gone === 1 ? "element" : "elements"} eliminated in one probe.`, {
          pointers: { lo, hi },
          range: [lo, hi],
        });
      }
    }
    t.emit(9, `lo crossed hi — the window is empty, so ${target} is not in the array. ${probes} probes to prove absence.`, {
      range: [0, -1],
    });
    return t.steps;
  },
};
