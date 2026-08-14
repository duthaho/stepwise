"use client";

import { Step } from "@/lib/trace";

const SLOT = 72;
const BOX_W = 46;
const BOX_H = 32;
const CY = 46; // node vertical center
const H = 132;

type NodeState = "idle" | "compare" | "swap" | "done" | "found";

function stateFor(index: number, step: Step): NodeState {
  const { hl } = step;
  if (hl.found === index) return "found";
  if (hl.swap?.includes(index)) return "swap";
  if (hl.compare?.includes(index)) return "compare";
  if (step.sorted.includes(index)) return "done";
  return "idle";
}

/** Arrow from node i to node `to`, routed by direction and distance. */
function arrowPath(i: number, to: number): string {
  const cx = (k: number) => k * SLOT + SLOT / 2;
  if (to === i + 1) {
    // adjacent forward: straight line at node height
    return `M ${cx(i) + BOX_W / 2 + 2} ${CY} L ${cx(to) - BOX_W / 2 - 7} ${CY}`;
  }
  if (to > i) {
    // long forward: arc over the top
    const x1 = cx(i) + BOX_W / 2 - 6;
    const x2 = cx(to) - BOX_W / 2 + 2;
    const depth = Math.min(26, 12 + (to - i) * 4);
    return `M ${x1} ${CY - BOX_H / 2} Q ${(x1 + x2) / 2} ${CY - BOX_H / 2 - depth} ${x2} ${CY - BOX_H / 2 - 2}`;
  }
  // backward (reversed links, cycle-back): arc under the bottom
  const x1 = cx(i) - BOX_W / 2 + 6;
  const x2 = cx(to) + BOX_W / 2 - 2;
  const depth = Math.min(34, 14 + (i - to) * 4);
  return `M ${x1} ${CY + BOX_H / 2} Q ${(x1 + x2) / 2} ${CY + BOX_H / 2 + depth} ${x2} ${CY + BOX_H / 2 + 2}`;
}

export function LinkedListViz({ step }: { step: Step }) {
  const n = step.cells.length;
  const links =
    step.hl.links ?? step.cells.map((_, i) => (i < n - 1 ? i + 1 : null));
  const W = n * SLOT;
  const cx = (k: number) => k * SLOT + SLOT / 2;

  // Group pointer labels landing on the same node.
  const labelGroups = new Map<number, string[]>();
  for (const [label, idx] of Object.entries(step.hl.pointers ?? {})) {
    if (idx < 0 || idx >= n) continue;
    const list = labelGroups.get(idx) ?? [];
    list.push(label);
    labelGroups.set(idx, list);
  }

  return (
    <div
      className="list-stage"
      role="img"
      aria-label={`Linked list of ${n} nodes: ${step.cells.map((c) => c.value).join(" → ")}`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="list-svg" aria-hidden="true">
        <defs>
          <marker id="ah-muted" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 z" className="list-ah-muted" />
          </marker>
          <marker id="ah-hot" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 z" className="list-ah-hot" />
          </marker>
        </defs>

        {links.map((to, i) =>
          to === null ? null : (
            <path
              key={`a${i}`}
              d={arrowPath(i, to)}
              className={`list-arrow${step.hl.swap?.includes(i) ? " is-hot" : ""}`}
              markerEnd={`url(#${step.hl.swap?.includes(i) ? "ah-hot" : "ah-muted"})`}
            />
          ),
        )}

        {step.cells.map((cell, i) => {
          const state = stateFor(i, step);
          return (
            <g key={cell.id}>
              <rect
                x={cx(i) - BOX_W / 2}
                y={CY - BOX_H / 2}
                width={BOX_W}
                height={BOX_H}
                rx={6}
                className="list-node"
                data-state={state === "idle" ? undefined : state}
              />
              <text x={cx(i)} y={CY + 4.5} className="list-val" data-state={state === "idle" ? undefined : state}>
                {cell.value}
              </text>
              {links[i] === null && (
                <text x={cx(i) + BOX_W / 2 + 12} y={CY + 4.5} className="list-null">
                  ∅
                </text>
              )}
            </g>
          );
        })}

        {[...labelGroups.entries()].map(([idx, labels]) => (
          <text key={idx} x={cx(idx)} y={H - 10} className="list-ptr">
            ▲ {labels.join("·")}
          </text>
        ))}
      </svg>
    </div>
  );
}
