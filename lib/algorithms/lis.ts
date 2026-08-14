import { Algorithm, Tracer } from "../trace";

export const lis: Algorithm = {
  id: "lis",
  name: "Longest increasing subsequence",
  tagline: "Every element asks all its predecessors: can I extend you?",
  code: `function lis(a: number[]) {
  const dp = new Array(a.length).fill(1);
  let best = 1;
  for (let i = 1; i < a.length; i++) {
    for (let j = 0; j < i; j++) {
      if (a[j] < a[i] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
      }
    }
    best = Math.max(best, dp[i]);
  }
  return best;
}`,
  facts: [
    { label: "time", value: "O(n²)" },
    { label: "space", value: "O(n)" },
    { label: "recurrence", value: "dp[i] = 1 + max dp[j], a[j] < a[i]" },
    { label: "follow-up", value: "O(n log n) exists" },
  ],
  intuition: [
    "Find the longest subsequence (not necessarily contiguous — you may skip elements) that strictly increases. Define dp[i] as the length of the best increasing subsequence that ends exactly at i. Then element i interrogates every earlier element j: if a[j] < a[i], the subsequence ending at j can be extended by i — take the best such offer, plus one. No smaller predecessor anywhere? Then i starts fresh at length 1.",
    "This is the classic O(n²) DP shape: each cell built by scanning all previous cells. Watch the labels under the bars — dp values only ever grow during i's scan, and the amber pair shows each j-vs-i interrogation. At the end, the green chain marks one actual longest subsequence, reconstructed by walking parent links backwards. Try the “Reversed” preset: every dp stays 1, the LIS of a decreasing array is a single element.",
    "The famous follow-up is O(n log n): keep an array of “smallest possible tail for each length” and binary-search where each new element lands — patience sorting. Understand this quadratic version first; the tails version computes the same lengths but is much harder to reconstruct from. LIS also hides inside 2-D problems: Russian doll envelopes is sort-then-LIS.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    const dp = Array.from({ length: n }, () => 1);
    const parent = Array.from({ length: n }, () => -1);
    const L = () => dp.map((d) => String(d));
    let best = 1;
    let bestEnd = 0;
    t.emit(2, "Every element starts as a subsequence of length 1 — itself.", { labels: L() });
    for (let i = 1; i < n; i++) {
      for (let j = 0; j < i; j++) {
        if (t.v(j) < t.v(i) && dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1;
          parent[i] = j;
          t.emit(7, `a[${j}]=${t.v(j)} < a[${i}]=${t.v(i)} and extending beats the current: dp[${i}] = ${dp[j]} + 1 = ${dp[i]}.`, {
            labels: L(),
            compare: [j],
            swap: [i],
          });
        } else {
          t.emit(6, t.v(j) >= t.v(i)
            ? `a[${j}]=${t.v(j)} ≥ a[${i}]=${t.v(i)} — cannot extend an increasing run.`
            : `a[${j}]=${t.v(j)} < a[${i}]=${t.v(i)}, but dp[${j}]+1=${dp[j] + 1} does not beat dp[${i}]=${dp[i]}.`, {
            labels: L(),
            compare: [j],
            key: i,
          });
        }
      }
      if (dp[i] > best) {
        best = dp[i];
        bestEnd = i;
      }
      t.emit(10, `dp[${i}] settles at ${dp[i]}. Longest so far: ${best}.`, {
        labels: L(),
        compare: [i],
      });
    }
    const chain: number[] = [];
    for (let k = bestEnd; k !== -1; k = parent[k]) chain.push(k);
    chain.reverse();
    for (const c of chain) t.markSorted(c);
    t.emit(12, `Longest increasing subsequence: length ${best} — [${chain.map((c) => t.v(c)).join(" → ")}], reconstructed via parent links.`, {
      labels: L(),
      stack: chain,
    });
    return t.steps;
  },
  stackLabel: "the subsequence",
};
