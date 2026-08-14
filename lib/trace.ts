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
  /** Labelled index markers rendered under the bars (lo / mid / hi …). */
  pointers?: Record<string, number>;
  /** Index where a search concluded. */
  found?: number;
  /** Indices currently held by a stack/deque, bottom→top (front→back). */
  stack?: number[];
  /** A candidate rectangle drawn over the bars (histogram problems). */
  area?: { from: number; to: number; height: number };
  /** Linked-list pointer state: links[i] = index node i points to, or null. */
  links?: (number | null)[];
  /** Binary-tree shape: indices into cells. Nodes absent from the tree are not drawn. */
  tree?: { root: number | null; left: (number | null)[]; right: (number | null)[] };
  /** Undirected graph edges [u, v] or weighted [u, v, w]. Static per trace. */
  graphEdges?: [number, number][] | [number, number, number][];
  /** The edge currently being examined/relaxed. */
  edge?: [number, number];
  /** Per-index annotations (dp values, distances). null = not shown. */
  labels?: (string | null)[];
};

export type Step = {
  /** 1-based line in the displayed source. */
  line: number;
  note: string;
  cells: Cell[];
  sorted: number[];
  hl: Highlight;
};

export type Fact = { label: string; value: string };

export type Algorithm = {
  id: string;
  name: string;
  tagline: string;
  code: string;
  facts: Fact[];
  /** Paragraphs: intuition first, then interview notes. */
  intuition: string[];
  /** Label for the stack chip strip, when the trace emits `hl.stack`. */
  stackLabel?: string;
  /** Extra numeric parameter (e.g. window size k), passed as trace's 2nd arg. */
  param?: { label: string; min: number; max: number; default: number };
  /** Whether this algorithm takes a search target (2nd trace arg). */
  usesTarget?: boolean;
  /** 2nd arg: search target, or the value of `param` for parameterized algorithms. */
  trace: (input: number[], target?: number) => Step[];
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
