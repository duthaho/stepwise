"use client";

import { Step } from "@/lib/trace";

type NodeState = "idle" | "compare" | "done" | "found";

function stateFor(index: number, step: Step): NodeState {
  const { hl } = step;
  if (hl.found === index) return "found";
  if (hl.compare?.includes(index)) return "compare";
  if (step.sorted.includes(index)) return "done";
  return "idle";
}

const R = 17;
const PAD = 30;
const SIZE = 300;

export function GraphViz({ step }: { step: Step }) {
  const n = step.cells.length;
  const edges = step.hl.graphEdges ?? [];
  const labels = step.hl.labels ?? [];

  // Circular layout — deterministic, SSR-safe, and reads cleanly for small n.
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const radius = SIZE / 2 - PAD;
  const pos = step.cells.map((_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  });

  const active = step.hl.edge;
  const isActive = (u: number, v: number) =>
    active !== undefined &&
    ((active[0] === u && active[1] === v) ||
      (active[0] === v && active[1] === u));

  return (
    <div className="graph-stage" role="img" aria-label={`Graph of ${n} nodes`}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="graph-svg" aria-hidden="true">
        {edges.map((e, i) => {
          const [u, v] = e;
          const w = e.length > 2 ? (e as [number, number, number])[2] : null;
          const mx = (pos[u].x + pos[v].x) / 2;
          const my = (pos[u].y + pos[v].y) / 2;
          return (
            <g key={i}>
              <line
                x1={pos[u].x}
                y1={pos[u].y}
                x2={pos[v].x}
                y2={pos[v].y}
                className={`graph-edge${isActive(u, v) ? " is-active" : ""}`}
              />
              {w !== null && (
                <text x={mx} y={my - 3} className="graph-weight">
                  {w}
                </text>
              )}
            </g>
          );
        })}
        {step.cells.map((cell, i) => {
          const state = stateFor(i, step);
          const label = labels[i];
          return (
            <g key={cell.id}>
              <circle
                cx={pos[i].x}
                cy={pos[i].y}
                r={R}
                className="graph-node"
                data-state={state === "idle" ? undefined : state}
              />
              <text x={pos[i].x} y={pos[i].y + 4} className="graph-val" data-state={state === "idle" ? undefined : state}>
                {i}
              </text>
              {label != null && (
                <text x={pos[i].x} y={pos[i].y - R - 5} className="graph-dist">
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
