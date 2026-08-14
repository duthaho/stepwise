"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SORTING_ALGORITHMS,
  SEARCHING_ALGORITHMS,
  STACK_ALGORITHMS,
  LIST_ALGORITHMS,
  TREE_ALGORITHMS,
  GRAPH_ALGORITHMS,
  DP_ALGORITHMS,
} from "@/lib/algorithms";
import { Algorithm } from "@/lib/trace";
import {
  DEFAULT_INPUT,
  DEFAULT_LIST_INPUT,
  DEFAULT_SEARCH_INPUT,
  DEFAULT_TREE_INPUT,
  DEFAULT_GRAPH_INPUT,
  DEFAULT_TARGET,
  makeInput,
  makeSearchInput,
  makeDistinctInput,
  parseCustomInput,
  pickMissing,
  pickPresent,
  Preset,
  PRESETS,
  SearchPreset,
  SEARCH_PRESETS,
} from "@/lib/input";
import { CodePanel } from "./code-panel";
import { ArrayViz, VizLegend, VizKind } from "./array-viz";
import { LinkedListViz } from "./linked-list-viz";
import { TreeViz } from "./tree-viz";
import { GraphViz } from "./graph-viz";

const SPEEDS = [0.5, 1, 2, 4];
const BASE_MS = 600;

export type TopicId =
  | "sorting"
  | "searching"
  | "stacks"
  | "linked-lists"
  | "trees"
  | "graphs"
  | "dp";

type Viz = "array" | "list" | "tree" | "graph";

type KindCfg = {
  title: string;
  kind: VizKind;
  viz: Viz;
  algorithms: Algorithm[];
  sizeMin: number;
  sizeMax: number;
  defaultInput: number[];
  /** Sort-style preset dropdown + custom "own" array input. */
  arrayControls: boolean;
  /** Sorted-array search controls (preset + target + click-to-search). */
  searchControls: boolean;
  newLabel: string;
};

const TOPICS: Record<TopicId, KindCfg> = {
  sorting: {
    title: "Sorting",
    kind: "sort",
    viz: "array",
    algorithms: SORTING_ALGORITHMS,
    sizeMin: 5,
    sizeMax: 24,
    defaultInput: DEFAULT_INPUT,
    arrayControls: true,
    searchControls: false,
    newLabel: "new array",
  },
  searching: {
    title: "Searching",
    kind: "search",
    viz: "array",
    algorithms: SEARCHING_ALGORITHMS,
    sizeMin: 5,
    sizeMax: 24,
    defaultInput: DEFAULT_SEARCH_INPUT,
    arrayControls: false,
    searchControls: true,
    newLabel: "new array",
  },
  stacks: {
    title: "Stacks & queues",
    kind: "stack",
    viz: "array",
    algorithms: STACK_ALGORITHMS,
    sizeMin: 5,
    sizeMax: 24,
    defaultInput: DEFAULT_INPUT,
    arrayControls: true,
    searchControls: false,
    newLabel: "new array",
  },
  "linked-lists": {
    title: "Linked lists",
    kind: "list",
    viz: "list",
    algorithms: LIST_ALGORITHMS,
    sizeMin: 3,
    sizeMax: 12,
    defaultInput: DEFAULT_LIST_INPUT,
    arrayControls: false,
    searchControls: false,
    newLabel: "new list",
  },
  trees: {
    title: "Trees",
    kind: "tree",
    viz: "tree",
    algorithms: TREE_ALGORITHMS,
    sizeMin: 4,
    sizeMax: 12,
    defaultInput: DEFAULT_TREE_INPUT,
    arrayControls: false,
    searchControls: false,
    newLabel: "new tree",
  },
  graphs: {
    title: "Graphs",
    kind: "graph",
    viz: "graph",
    algorithms: GRAPH_ALGORITHMS,
    sizeMin: 5,
    sizeMax: 10,
    defaultInput: DEFAULT_GRAPH_INPUT,
    arrayControls: false,
    searchControls: false,
    newLabel: "new graph",
  },
  dp: {
    title: "Dynamic programming",
    kind: "dp",
    viz: "array",
    algorithms: DP_ALGORITHMS,
    sizeMin: 4,
    sizeMax: 16,
    defaultInput: DEFAULT_INPUT,
    arrayControls: true,
    searchControls: false,
    newLabel: "new array",
  },
};

const Icon = {
  play: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 2.5v11l9-5.5-9-5.5z" />
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />
    </svg>
  ),
  stepBack: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M11.5 2.5v11L5 8l6.5-5.5zM3 2.5h1.8v11H3z" />
    </svg>
  ),
  stepFwd: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4.5 2.5v11L11 8 4.5 2.5zM11.2 2.5H13v11h-1.8z" />
    </svg>
  ),
  restart: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 3a5 5 0 1 0 4.9 6h-1.55A3.5 3.5 0 1 1 8 4.5V7l4-3-4-3v2z" />
    </svg>
  ),
};

export function Playground({ topic }: { topic: TopicId }) {
  const cfg = TOPICS[topic];
  const { title, kind, viz, algorithms } = cfg;

  const [algId, setAlgId] = useState(algorithms[0].id);
  const [input, setInput] = useState<number[]>(cfg.defaultInput);
  const [size, setSize] = useState(cfg.defaultInput.length);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [targetText, setTargetText] = useState(String(DEFAULT_TARGET));
  const [preset, setPreset] = useState<Preset>("random");
  const [searchPreset, setSearchPreset] = useState<SearchPreset>("distinct");
  const [custom, setCustom] = useState("");
  const [customBad, setCustomBad] = useState(false);
  const [param, setParam] = useState<number | null>(null);

  const alg = algorithms.find((a) => a.id === algId) ?? algorithms[0];
  const wantsTarget = cfg.searchControls || !!alg.usesTarget;

  const paramMax = alg.param
    ? Math.min(alg.param.max, input.length)
    : undefined;
  const paramVal = alg.param
    ? Math.max(
        alg.param.min,
        Math.min(param ?? alg.param.default, paramMax ?? alg.param.max),
      )
    : undefined;

  const steps = useMemo(
    () => alg.trace(input, wantsTarget ? target : paramVal),
    [alg, input, wantsTarget, target, paramVal],
  );

  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const step = steps[Math.min(cursor, steps.length - 1)];
  const atEnd = cursor >= steps.length - 1;

  // Reset the player when the trace changes (render-time state adjustment).
  const [prevSteps, setPrevSteps] = useState(steps);
  if (steps !== prevSteps) {
    setPrevSteps(steps);
    setCursor(0);
    setPlaying(false);
  }
  if (playing && atEnd) setPlaying(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setCursor((c) => Math.min(c + 1, steps.length - 1));
    }, BASE_MS / speed);
    return () => clearInterval(id);
  }, [playing, speed, steps.length]);

  const togglePlay = useCallback(() => {
    if (atEnd) {
      setCursor(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  }, [atEnd]);

  const stepBy = useCallback(
    (d: number) => {
      setPlaying(false);
      setCursor((c) => Math.max(0, Math.min(c + d, steps.length - 1)));
    },
    [steps.length],
  );

  // Keyboard transport: space toggles, arrows step. Skipped while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName)) return;
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepBy(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepBy(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, stepBy]);

  const setTargetInner = (v: number) => {
    setTarget(v);
    setTargetText(String(v));
  };

  const genInput = (n: number, p: Preset, sp: SearchPreset): number[] => {
    if (cfg.viz === "tree") return makeDistinctInput(n);
    if (cfg.searchControls) return makeSearchInput(sp, n);
    return makeInput(p, n);
  };

  const regenerate = (n: number, p = preset, sp = searchPreset) => {
    setSize(n);
    setPreset(p);
    setSearchPreset(sp);
    const next = genInput(n, p, sp);
    setInput(next);
    setCustom("");
    setCustomBad(false);
    if (wantsTarget) setTargetInner(pickPresent(next));
  };

  const applyTargetText = () => {
    const v = Number(targetText.trim());
    if (Number.isFinite(v) && v >= 1 && v <= 999) setTarget(Math.round(v));
    else setTargetText(String(target));
  };

  const applyCustom = () => {
    const parsed = parseCustomInput(custom);
    if (!parsed) {
      setCustomBad(true);
      return;
    }
    setCustomBad(false);
    setSize(parsed.length);
    setInput(parsed);
  };

  return (
    <>
      <div className="pg-head">
        <h1 className="pg-title">{title}</h1>
        <div className="tabs" role="tablist" aria-label={`${title} algorithms`}>
          {algorithms.map((a) => (
            <button
              key={a.id}
              role="tab"
              aria-selected={a.id === algId}
              className="tab"
              onClick={() => setAlgId(a.id)}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      <div className="pg">
        <div className="pg-code">
          <CodePanel code={alg.code} activeLine={step.line} title={alg.name} />
        </div>

        <div className="pg-viz">
          <section className="card" aria-label="Visualization">
            <div className="card-head">
              <span className="card-title">{alg.name} · live</span>
              {wantsTarget ? (
                <span className="target-chip">target = {target}</span>
              ) : (
                <span className="card-sub">{alg.tagline}</span>
              )}
            </div>

            {viz === "list" ? (
              <LinkedListViz step={step} />
            ) : viz === "tree" ? (
              <TreeViz step={step} />
            ) : viz === "graph" ? (
              <GraphViz step={step} />
            ) : (
              <ArrayViz
                step={step}
                reservePointerRow={cfg.searchControls}
                stackLabel={alg.stackLabel}
                onBarClick={cfg.searchControls ? setTargetInner : undefined}
              />
            )}
            {(viz === "tree" || viz === "graph") && alg.stackLabel && (
              <StackStrip
                step={step}
                label={alg.stackLabel}
                mode={viz === "graph" ? "index" : "value"}
              />
            )}
            <VizLegend kind={kind} />

            <div className="narr">
              <p className="narr-note" aria-live="polite">
                {step.note}
              </p>
              <span className="narr-count">
                {cursor + 1} / {steps.length}
              </span>
            </div>

            <div className="transport">
              <button
                type="button"
                className="ctl-btn"
                onClick={() => stepBy(-steps.length)}
                disabled={cursor === 0}
                aria-label="Restart"
              >
                {Icon.restart}
              </button>
              <button
                type="button"
                className="ctl-btn"
                onClick={() => stepBy(-1)}
                disabled={cursor === 0}
                aria-label="Step back"
              >
                {Icon.stepBack}
              </button>
              <button
                type="button"
                className="ctl-btn is-primary"
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? Icon.pause : Icon.play}
              </button>
              <button
                type="button"
                className="ctl-btn"
                onClick={() => stepBy(1)}
                disabled={atEnd}
                aria-label="Step forward"
              >
                {Icon.stepFwd}
              </button>
              <input
                type="range"
                className="scrub"
                min={0}
                max={steps.length - 1}
                value={cursor}
                onChange={(e) => {
                  setPlaying(false);
                  setCursor(Number(e.target.value));
                }}
                aria-label="Scrub through steps"
              />
              <div className="seg" aria-label="Playback speed">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="seg-btn"
                    aria-pressed={s === speed}
                    onClick={() => setSpeed(s)}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>

            <div className="data-row">
              {(cfg.arrayControls || cfg.searchControls) && (
                <label className="field">
                  data
                  {cfg.searchControls ? (
                    <select
                      className="select"
                      value={searchPreset}
                      onChange={(e) =>
                        regenerate(size, preset, e.target.value as SearchPreset)
                      }
                    >
                      {SEARCH_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      className="select"
                      value={preset}
                      onChange={(e) =>
                        regenerate(size, e.target.value as Preset)
                      }
                    >
                      {PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              )}

              <label className="field">
                n = {size}
                <input
                  type="range"
                  className="size-range"
                  min={cfg.sizeMin}
                  max={cfg.sizeMax}
                  value={size}
                  onChange={(e) => regenerate(Number(e.target.value))}
                  aria-label="Size"
                />
              </label>

              <button
                type="button"
                className="ghost-btn"
                onClick={() => regenerate(size)}
              >
                {cfg.newLabel}
              </button>

              {alg.param && (
                <label className="field">
                  {alg.param.label} = {paramVal}
                  <input
                    type="range"
                    className="size-range"
                    min={alg.param.min}
                    max={paramMax}
                    value={paramVal}
                    onChange={(e) => setParam(Number(e.target.value))}
                    aria-label={alg.param.label}
                  />
                </label>
              )}

              {wantsTarget && (
                <>
                  <label className="field">
                    target
                    <input
                      type="text"
                      inputMode="numeric"
                      className="text-input is-short"
                      value={targetText}
                      onChange={(e) => setTargetText(e.target.value)}
                      onBlur={applyTargetText}
                      onKeyDown={(e) => e.key === "Enter" && applyTargetText()}
                      aria-label="Target value, 1 to 999"
                    />
                  </label>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => setTargetInner(pickPresent(input))}
                  >
                    pick present
                  </button>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => setTargetInner(pickMissing(input))}
                  >
                    pick missing
                  </button>
                </>
              )}

              {cfg.arrayControls && (
                <>
                  <label className="field">
                    own
                    <input
                      type="text"
                      className={`text-input${customBad ? " is-invalid" : ""}`}
                      placeholder="e.g. 8, 3, 55, 21, 4"
                      value={custom}
                      onChange={(e) => {
                        setCustom(e.target.value);
                        setCustomBad(false);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && applyCustom()}
                      aria-label="Custom array, comma separated, 2 to 32 values from 1 to 999"
                      aria-invalid={customBad}
                    />
                  </label>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={applyCustom}
                  >
                    run it
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="info">
        <div className="prose">
          <h2>How {alg.name.toLowerCase()} works</h2>
          {alg.intuition.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="kbd-hint">
            <kbd>space</kbd> play / pause · <kbd>←</kbd>
            <kbd>→</kbd> step
          </p>
        </div>
        <div>
          <h2>Complexity</h2>
          <table className="cx-table">
            <tbody>
              {alg.facts.map((f) => (
                <tr key={f.label}>
                  <th scope="row">{f.label}</th>
                  <td>{f.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/** Chip strip of stack/queue contents for tree & graph vizzes. */
function StackStrip({
  step,
  label,
  mode,
}: {
  step: import("@/lib/trace").Step;
  label: string;
  mode: "value" | "index";
}) {
  const stack = step.hl.stack;
  if (stack === undefined) return null;
  const n = step.cells.length;
  return (
    <div className="stack-row" aria-label="Frontier contents">
      <span className="stack-label">{label}</span>
      {stack.length === 0 ? (
        <span className="stack-empty">empty</span>
      ) : (
        stack
          .filter((i) => i >= 0 && i < n)
          .map((i, k) => (
            <span key={k} className="stack-chip">
              {mode === "index" ? i : step.cells[i].value}
            </span>
          ))
      )}
    </div>
  );
}
