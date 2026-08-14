"use client";

import { Step } from "@/lib/trace";

type NodeState = "idle" | "compare" | "swap" | "done" | "found";

function stateFor(index: number, step: Step): NodeState {
  const { hl } = step;
  if (hl.found === index) return "found";
  if (hl.swap?.includes(index)) return "swap";
  if (hl.key === index) return "swap";
  if (hl.compare?.includes(index)) return "compare";
  if (step.sorted.includes(index)) return "done";
  return "idle";
}

const R = 15;
const VGAP = 62;

export function TreeViz({ step }: { step: Step }) {
  const tree = step.hl.tree;
  const n = step.cells.length;

  // Assign x by in-order index, y by depth — the standard tidy-ish BST layout.
  const xOf = new Array<number>(n).fill(-1);
  const yOf = new Array<number>(n).fill(-1);
  let depthMax = 0;

  if (tree && tree.root !== null) {
    let col = 0;
    const assign = (node: number | null, depth: number) => {
      if (node === null) return;
      assign(tree.left[node], depth + 1);
      xOf[node] = col++;
      yOf[node] = depth;
      depthMax = Math.max(depthMax, depth);
      assign(tree.right[node], depth + 1);
    };
    assign(tree.root, 0);
  }

  const placed = tree ? xOf.filter((x) => x >= 0).length : 0;
  const W = Math.max(1, placed) * (R * 2 + 14);
  const H = (depthMax + 1) * VGAP + R * 2;
  const cx = (i: number) => xOf[i] * (R * 2 + 14) + R + 7;
  const cy = (i: number) => yOf[i] * VGAP + R + 8;

  const edges: [number, number][] = [];
  if (tree) {
    for (let i = 0; i < n; i++) {
      if (xOf[i] < 0) continue;
      if (tree.left[i] !== null) edges.push([i, tree.left[i]!]);
      if (tree.right[i] !== null) edges.push([i, tree.right[i]!]);
    }
  }

  return (
    <div
      className="tree-stage"
      role="img"
      aria-label={`Binary search tree of ${placed} nodes`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="tree-svg" aria-hidden="true">
        {edges.map(([u, v]) => (
          <line
            key={`${u}-${v}`}
            x1={cx(u)}
            y1={cy(u)}
            x2={cx(v)}
            y2={cy(v)}
            className="tree-edge"
          />
        ))}
        {step.cells.map((cell, i) => {
          if (xOf[i] < 0) return null;
          const state = stateFor(i, step);
          return (
            <g key={cell.id}>
              <circle
                cx={cx(i)}
                cy={cy(i)}
                r={R}
                className="tree-node"
                data-state={state === "idle" ? undefined : state}
              />
              <text
                x={cx(i)}
                y={cy(i) + 4}
                className="tree-val"
                data-state={state === "idle" ? undefined : state}
              >
                {cell.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
