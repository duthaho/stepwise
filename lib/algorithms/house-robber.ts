import { Algorithm, Tracer } from "../trace";

export const houseRobber: Algorithm = {
  id: "house-robber",
  name: "House robber",
  tagline: "Take it or skip it — two running answers cover every plan.",
  code: `function rob(a: number[]) {
  let take = 0; // best plan that robs the current house
  let skip = 0; // best plan that skips it
  for (let i = 0; i < a.length; i++) {
    const newTake = skip + a[i];
    const newSkip = Math.max(take, skip);
    take = newTake;
    skip = newSkip;
  }
  return Math.max(take, skip);
}`,
  facts: [
    { label: "time", value: "O(n)" },
    { label: "space", value: "O(1)" },
    { label: "recurrence", value: "take = skip + a[i] · skip = max(take, skip)" },
    { label: "pattern", value: "state-machine DP" },
  ],
  intuition: [
    "Rob houses along a street for maximum loot, but never two adjacent ones. Greedy fails immediately — grabbing the richest house can block two better neighbours. The DP move is to stop asking “which houses?” and ask “what is the best I can do up to house i, split by one bit of state: did I rob house i or not?”",
    "If you rob house i, you cannot have robbed i−1 — so your total is a[i] plus the best skip plan from the previous house. If you skip house i, you take the better of the two previous plans, robbed or not. Two variables, updated in lockstep (note the temporaries — updating take before reading the old skip is the classic bug). The label under each bar shows max(take, skip) so far; green bars are processed.",
    "This “small state machine per element” shape is one of DP's most reusable ideas — the same skeleton solves stock-trading problems (holding / not holding), paint-house (color states), and delete-and-earn. The named follow-up: House Robber II puts the street on a circle — run this twice, once excluding the first house, once excluding the last.",
  ],
  trace(input) {
    const t = new Tracer(input);
    const n = t.arr.length;
    let take = 0;
    let skip = 0;
    const best: (string | null)[] = Array.from({ length: n }, () => null);
    t.emit(2, "Two running plans: take (rob the current house) and skip. Both start at 0.", {
      labels: [...best],
    });
    for (let i = 0; i < n; i++) {
      t.emit(4, `House ${i} holds ${t.v(i)}. Rob it: ${skip} + ${t.v(i)} = ${skip + t.v(i)}. Skip it: max(${take}, ${skip}) = ${Math.max(take, skip)}.`, {
        labels: [...best],
        compare: [i],
      });
      const newTake = skip + t.v(i);
      const newSkip = Math.max(take, skip);
      take = newTake;
      skip = newSkip;
      best[i] = String(Math.max(take, skip));
      t.markSorted(i);
      t.emit(7, `Best loot through house ${i}: ${Math.max(take, skip)} (take=${take}, skip=${skip}).`, {
        labels: [...best],
        compare: [i],
      });
    }
    t.emit(10, `Every house considered — maximum loot: ${Math.max(take, skip)}.`, {
      labels: [...best],
    });
    return t.steps;
  },
};
