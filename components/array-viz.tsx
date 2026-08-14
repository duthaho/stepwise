"use client";

import { Step } from "@/lib/trace";

type BarState = "idle" | "compare" | "swap" | "done" | "key" | "pivot";

function stateFor(index: number, step: Step): BarState {
  const { hl } = step;
  if (hl.found === index) return "done";
  if (hl.swap?.includes(index)) return "swap";
  if (hl.pivot === index) return "pivot";
  if (hl.key === index) return "key";
  if (hl.compare?.includes(index)) return "compare";
  if (step.sorted.includes(index)) return "done";
  return "idle";
}

export function ArrayViz({
  step,
  reservePointerRow = false,
  onBarClick,
}: {
  step: Step;
  /** Keeps space under the bars for lo/mid/hi markers (searching topics). */
  reservePointerRow?: boolean;
  onBarClick?: (value: number) => void;
}) {
  const n = step.cells.length;
  const max = Math.max(...step.cells.map((c) => c.value));
  const inRange = (i: number) =>
    !step.hl.range || (i >= step.hl.range[0] && i <= step.hl.range[1]);

  // Render bars keyed by cell id, positioned by index — swaps become slides.
  const positioned = step.cells
    .map((cell, index) => ({ cell, index }))
    .sort((a, b) => a.cell.id - b.cell.id);

  // Group pointer labels landing on the same index (e.g. lo·mid).
  const pointerGroups: { index: number; labels: string[] }[] = [];
  if (step.hl.pointers) {
    const byIndex = new Map<number, string[]>();
    for (const [label, idx] of Object.entries(step.hl.pointers)) {
      if (idx < 0 || idx > n) continue;
      const list = byIndex.get(idx) ?? [];
      list.push(label);
      byIndex.set(idx, list);
    }
    for (const [index, labels] of byIndex) pointerGroups.push({ index, labels });
  }

  return (
    <div
      className={[
        "viz-stage",
        n > 16 ? "is-crowded" : "",
        reservePointerRow ? "has-pointers" : "",
        onBarClick ? "is-clickable" : "",
      ]
        .filter(Boolean)
        .join(" ")}
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
            {onBarClick ? (
              <button
                type="button"
                className="bar-fill bar-hit"
                onClick={() => onBarClick(cell.value)}
                aria-label={`Search for ${cell.value}`}
              />
            ) : (
              <div className="bar-fill" />
            )}
          </div>
        );
      })}
      {pointerGroups.map(({ index, labels }) => (
        <div
          key={labels.join()}
          className={`ptr${index === n ? " ptr-end" : ""}`}
          style={{ ["--i" as string]: Math.min(index, n - 1) }}
        >
          ▲ {labels.join("·")}
          {index === n ? " (end)" : ""}
        </div>
      ))}
    </div>
  );
}

export function VizLegend({ kind }: { kind: "sort" | "search" }) {
  const items: { label: string; token: string }[] =
    kind === "sort"
      ? [
          { label: "comparing", token: "var(--color-viz-compare)" },
          { label: "swapping", token: "var(--color-viz-swap)" },
          { label: "settled", token: "var(--color-viz-done)" },
          { label: "untouched", token: "var(--color-viz-bar)" },
        ]
      : [
          { label: "probing", token: "var(--color-viz-compare)" },
          { label: "found", token: "var(--color-viz-done)" },
          { label: "candidates", token: "var(--color-viz-bar)" },
        ];
  return (
    <div className="legend" aria-hidden="true">
      {items.map((it) => (
        <span key={it.label} className="legend-item">
          <span className="legend-chip" style={{ background: it.token }} />
          {it.label}
        </span>
      ))}
      {kind === "search" && (
        <span className="legend-item legend-hint">dimmed = eliminated · click a bar to search for it</span>
      )}
    </div>
  );
}
