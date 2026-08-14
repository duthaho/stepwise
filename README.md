# stepwise()

Interactive DSA learning. Every topic is real code you can step through line
by line while a synced visualization shows exactly what the algorithm is
doing — play, pause, scrub, change speed, and feed it your own input.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Seven topics, 23 algorithms:

- **Sorting** — bubble, insertion, selection, merge, quick
- **Searching** — linear, binary, lower bound
- **Linked lists** — reverse, find middle, cycle detection
- **Stacks & queues** — next greater, sliding window max, largest rectangle
- **Trees** — BST insert, BST search, in-order traversal
- **Graphs** — BFS, DFS, Dijkstra
- **Dynamic programming** — min-cost stairs, house robber, LIS

## How it works

The core idea is a **tracer engine**, not hand-made animations per topic.

1. An algorithm runs once, instrumented, and records a `Step[]`:
   the executing source line, a snapshot of the data, highlight roles
   (compare / swap / pivot / key / stack / pointers / tree / graph edges /
   labels …), and a one-line narration.
2. The UI never runs the algorithm — the player just scrubs an index over
   that array. Stepping backward is free.
3. Cells carry stable ids, so elements are keyed by identity and moves
   animate as physical transitions (CSS `transform` only).
4. Four visualizations render from the same `Step`: an array of bars, a
   linked-list of boxes-and-arrows (SVG), a 2D binary tree (SVG), and a
   circular graph with weighted edges (SVG). Which one a topic uses is a
   single field in its config.

```
lib/trace.ts            Step / Highlight types + the Tracer recorder
lib/algorithms/*.ts     one file per algorithm: display code, complexity,
                        intuition paragraphs, and the instrumented trace()
lib/input.ts            dataset presets (random / nearly sorted / reversed /
                        few unique) + custom-input parsing
components/playground.tsx   player state, transport, keyboard shortcuts
components/code-panel.tsx   line-numbered source with active-line highlight
components/array-viz.tsx    identity-keyed bars + state colors
```

## Adding an algorithm

Create `lib/algorithms/<name>.ts` exporting an `Algorithm`:

- `code` — the displayed source (keep it ≤ ~20 lines)
- `trace(input)` — re-implement it against a `Tracer`, calling
  `t.emit(line, note, highlights)` at every meaningful moment
- `complexity` + `intuition` — the study content

Register it in `lib/algorithms/index.ts`. The playground UI needs no changes.

Line numbers in `emit()` refer to the displayed `code` string — keep them in
sync when editing either.

## Keyboard

`space` play/pause · `←` / `→` step · scrubber drags anywhere in the trace.
