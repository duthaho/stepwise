"use client";

import { Step } from "@/lib/trace";

type BarState = "idle" | "compare" | "swap" | "done" | "key" | "pivot";

function stateFor(index: number, step: Step): BarState {
  const { hl } = step;
  if (hl.swap?.includes(index)) return "swap";
  if (hl.pivot === index) return "pivot";
  if (hl.key === index) return "key";
  if (hl.compare?.includes(index)) return "compare";
  if (step.sorted.includes(index)) return "done";
  return "idle";
}

export function ArrayViz({ step }: { step: Step }) {
  const n = step.cells.length;
  const max = Math.max(...step.cells.map((c) => c.value));
  const inRange = (i: number) =>
    !step.hl.range || (i >= step.hl.range[0] && i <= step.hl.range[1]);

  // Render bars keyed by cell id, positioned by index — swaps become slides.
  const positioned = step.cells
    .map((cell, index) => ({ cell, index }))
    .sort((a, b) => a.cell.id - b.cell.id);

  return (
    <div
      className={`viz-stage${n > 16 ? " is-crowded" : ""}`}
      style={{ ["--n" as string]: n }}
      role="img"
      aria-label={`Array of ${n} values: ${step.cells.map((c) => c.value).join(", ")}`}
    >
      {positioned.map(({ cell, index }) => {
        const state = stateFor(index, step);
        return (
          <div
            key={cell.id}
            className={`bar${inRange(index) || state === "done" ? "" : " is-dim"}`}
            data-state={state === "idle" ? undefined : state}
            style={{
              ["--i" as string]: index,
              ["--h" as string]: Math.max(6, (cell.value / max) * 88),
            }}
          >
            <span className="bar-val">{cell.value}</span>
            <div className="bar-fill" />
          </div>
        );
      })}
    </div>
  );
}

export function VizLegend() {
  const items: { label: string; token: string }[] = [
    { label: "comparing", token: "var(--color-viz-compare)" },
    { label: "swapping", token: "var(--color-viz-swap)" },
    { label: "settled", token: "var(--color-viz-done)" },
    { label: "untouched", token: "var(--color-viz-bar)" },
  ];
  return (
    <div className="legend" aria-hidden="true">
      {items.map((it) => (
        <span key={it.label} className="legend-item">
          <span className="legend-chip" style={{ background: it.token }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}
