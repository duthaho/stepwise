import { Algorithm, Tracer } from "../trace";

export const linearSearch: Algorithm = {
  id: "linear",
  name: "Linear search",
  tagline: "Check every element until you find it — the honest baseline.",
  code: `function linearSearch(a: number[], target: number) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] === target) return i;
  }
  return -1;
}`,
  facts: [
    { label: "best", value: "O(1)" },
    { label: "average", value: "O(n)" },
    { label: "worst", value: "O(n)" },
    { label: "space", value: "O(1)" },
    { label: "requires", value: "nothing" },
  ],
  intuition: [
    "Walk the array front to back, comparing each element with the target. Nothing clever — and that is its virtue: it works on unsorted data, on linked lists, on streams you can only read once. When the data has no structure to exploit, this is the answer, and it is optimal: you cannot verify absence without looking at everything.",
    "The interview point is knowing when to abandon it. The moment the interviewer says the array is sorted, they are inviting you to do better — every probe here eliminates exactly one element, while binary search eliminates half. Watch the probe counter and compare the same target on the binary search tab.",
    "Also worth saying out loud: for a single lookup, sorting first (O(n log n)) to enable binary search is a loss. Binary search pays off when you search the same data many times.",
  ],
  trace(input, target = input[0]) {
    const t = new Tracer(input);
    const n = t.arr.length;
    t.emit(2, `Search for ${target}. Start at the front, probe one by one.`);
    for (let i = 0; i < n; i++) {
      const v = t.v(i);
      if (v === target) {
        t.emit(3, `Probe ${i + 1}: a[${i}] = ${v} — match! Found ${target} at index ${i} in ${i + 1} probes.`, {
          found: i,
        });
        return t.steps;
      }
      t.emit(3, `Probe ${i + 1}: a[${i}] = ${v} — not ${target}, keep going.`, {
        compare: [i],
      });
    }
    t.emit(5, `Scanned all ${n} elements — ${target} is not here. Absence costs the full n probes.`);
    return t.steps;
  },
};
