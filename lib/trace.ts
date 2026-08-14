/**
 * The tracer engine. An algorithm runs once, instrumented, and records a
 * Step for every meaningful moment: which source line is executing, what
 * the array looks like, which indices are hot, and a one-line narration.
 * The UI never runs the algorithm — it scrubs an index over Step[].
 */

export type Cell = {
  /** Stable identity — bars are keyed on this so swaps animate as slides. */
  id: number;
  value: number;
};

export type Highlight = {
  /** Indices being compared this step. */
  compare?: number[];
  /** Indices that just swapped. */
  swap?: number[];
  /** Pivot index (quick sort). */
  pivot?: number;
  /** The held key element (insertion sort) or current minimum (selection). */
  key?: number;
  /** Active window [lo, hi] — bars outside are dimmed. */
  range?: [number, number];
};

export type Step = {
  /** 1-based line in the displayed source. */
  line: number;
  note: string;
  cells: Cell[];
  sorted: number[];
  hl: Highlight;
};

export type Complexity = {
  best: string;
  average: string;
  worst: string;
  space: string;
  stable: "yes" | "no";
};

export type Algorithm = {
  id: string;
  name: string;
  tagline: string;
  code: string;
  complexity: Complexity;
  /** Paragraphs: intuition first, then interview notes. */
  intuition: string[];
  trace: (input: number[]) => Step[];
};

export function toCells(values: number[]): Cell[] {
  return values.map((value, id) => ({ id, value }));
}

export class Tracer {
  arr: Cell[];
  steps: Step[] = [];
  private sorted = new Set<number>();

  constructor(values: number[]) {
    this.arr = toCells(values);
  }

  v(i: number): number {
    return this.arr[i].value;
  }

  swap(i: number, j: number) {
    const t = this.arr[i];
    this.arr[i] = this.arr[j];
    this.arr[j] = t;
  }

  /** Move the cell at `from` to `to`, shifting the cells in between. */
  move(from: number, to: number) {
    const [c] = this.arr.splice(from, 1);
    this.arr.splice(to, 0, c);
  }

  markSorted(...idx: number[]) {
    for (const i of idx) this.sorted.add(i);
  }

  markAllSorted() {
    for (let i = 0; i < this.arr.length; i++) this.sorted.add(i);
  }

  emit(line: number, note: string, hl: Highlight = {}) {
    this.steps.push({
      line,
      note,
      cells: this.arr.map((c) => ({ ...c })),
      sorted: [...this.sorted].sort((a, b) => a - b),
      hl,
    });
  }
}
