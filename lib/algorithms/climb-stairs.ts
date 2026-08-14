import { Algorithm, Tracer } from "../trace";

export const climbStairs: Algorithm = {
  id: "climb-stairs",
  name: "Min cost stairs",
  tagline: "Each step's answer is built from two answers you already have.",
  code: `function minCost(cost: number[]) {
  const n = cost.length;
  const dp = new Array(n).fill(0);
  dp[0] = cost[0];
  dp[1] = cost[1];
  for (let i = 2; i < n; i++) {
    dp[i] = cost[i] + Math.min(dp[i - 1], dp[i - 2]);
  }
  return Math.min(dp[n - 1], dp[n - 2]);
}`,
  facts: [
    { label: "time", value: "O(n)" },
    { label: "space", value: "O(n) → O(1)" },
    { label: "recurrence", value: "dp[i] = cost[i] + min(dp[i−1], dp[i−2])" },
    { label: "pattern", value: "1-D bottom-up" },
  ],
  intuition: [
    "You climb a staircase paying each step's cost, moving 1 or 2 steps at a time, starting from step 0 or 1, and you may finish off the end from either of the last two steps. The question “what is the cheapest way to stand on step i?” has a tiny answer: you arrived from i−1 or i−2, so it is cost[i] plus the cheaper of those two already-solved answers. That equation — the recurrence — is the entire algorithm.",
    "This is dynamic programming with all the mystery removed: an overlapping-subproblem structure (naive recursion would recompute the same steps exponentially often) collapsed into one left-to-right pass, because by the time you reach step i, both answers it depends on are sitting in the table. Watch the dp labels fill under the bars — each one computed once, from two neighbours, never revised.",
    "Two habits to build here that carry to every DP: read the recurrence out loud before coding (if you cannot state it, the code will not save you), and notice the space optimization — dp[i] only looks back two slots, so two variables replace the whole array, O(n) → O(1). Interviewers ask for that follow-up almost every time.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    const dp: (number | null)[] = Array.from({ length: n }, () => null);
    const L = () => dp.map((d) => (d === null ? null : String(d)));
    dp[0] = t.v(0);
    t.markSorted(0);
    t.emit(4, `Base case: standing on step 0 costs its own price, ${dp[0]}.`, {
      labels: L(),
      compare: [0],
    });
    dp[1] = t.v(1);
    t.markSorted(1);
    t.emit(5, `Base case: you may also start on step 1 — cost ${dp[1]}.`, {
      labels: L(),
      compare: [1],
    });
    for (let i = 2; i < n; i++) {
      t.emit(7, `Step ${i}: arrive from step ${i - 1} (total ${dp[i - 1]}) or step ${i - 2} (total ${dp[i - 2]})?`, {
        labels: L(),
        compare: [i - 1, i - 2],
        key: i,
      });
      const from = dp[i - 1]! <= dp[i - 2]! ? i - 1 : i - 2;
      dp[i] = t.v(i) + Math.min(dp[i - 1]!, dp[i - 2]!);
      t.markSorted(i);
      t.emit(7, `dp[${i}] = ${t.v(i)} + min(${dp[i - 1]}, ${dp[i - 2]}) = ${dp[i]} — via step ${from}. Solved once, never revisited.`, {
        labels: L(),
        compare: [i],
      });
    }
    const ans = Math.min(dp[n - 1]!, dp[n - 2]!);
    t.emit(9, `Finish from step ${dp[n - 1]! <= dp[n - 2]! ? n - 1 : n - 2}: cheapest total is ${ans}.`, {
      labels: L(),
      found: dp[n - 1]! <= dp[n - 2]! ? n - 1 : n - 2,
    });
    return t.steps;
  },
};
