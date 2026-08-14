"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SORTING_ALGORITHMS, SEARCHING_ALGORITHMS } from "@/lib/algorithms";
import { Algorithm } from "@/lib/trace";
import {
  DEFAULT_INPUT,
  DEFAULT_SEARCH_INPUT,
  DEFAULT_TARGET,
  makeInput,
  makeSearchInput,
  parseCustomInput,
  pickMissing,
  pickPresent,
  Preset,
  PRESETS,
  SearchPreset,
  SEARCH_PRESETS,
} from "@/lib/input";
import { CodePanel } from "./code-panel";
import { ArrayViz, VizLegend } from "./array-viz";

const SPEEDS = [0.5, 1, 2, 4];
const BASE_MS = 600;

export type TopicId = "sorting" | "searching";

const TOPICS: Record<
  TopicId,
  { title: string; kind: "sort" | "search"; algorithms: Algorithm[] }
> = {
  sorting: { title: "Sorting", kind: "sort", algorithms: SORTING_ALGORITHMS },
  searching: {
    title: "Searching",
    kind: "search",
    algorithms: SEARCHING_ALGORITHMS,
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
  const { title, kind, algorithms } = TOPICS[topic];
  const isSearch = kind === "search";

  const [algId, setAlgId] = useState(algorithms[0].id);
  const [input, setInput] = useState<number[]>(
    isSearch ? DEFAULT_SEARCH_INPUT : DEFAULT_INPUT,
  );
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [targetText, setTargetText] = useState(String(DEFAULT_TARGET));
  const [sortPreset, setSortPreset] = useState<Preset>("random");
  const [searchPreset, setSearchPreset] = useState<SearchPreset>("distinct");
  const [size, setSize] = useState(
    isSearch ? DEFAULT_SEARCH_INPUT.length : DEFAULT_INPUT.length,
  );
  const [custom, setCustom] = useState("");
  const [customBad, setCustomBad] = useState(false);

  const alg = algorithms.find((a) => a.id === algId) ?? algorithms[0];
  const steps = useMemo(
    () => alg.trace(input, isSearch ? target : undefined),
    [alg, input, isSearch, target],
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
  // Stop at the last step.
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

  const regenerateSort = (p: Preset, n: number) => {
    setSortPreset(p);
    setSize(n);
    setInput(makeInput(p, n));
    setCustom("");
    setCustomBad(false);
  };

  const regenerateSearch = (p: SearchPreset, n: number) => {
    setSearchPreset(p);
    setSize(n);
    const next = makeSearchInput(p, n);
    setInput(next);
    setTargetInner(pickPresent(next));
  };

  const setTargetInner = (v: number) => {
    setTarget(v);
    setTargetText(String(v));
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
              {isSearch ? (
                <span className="target-chip">target = {target}</span>
              ) : (
                <span className="card-sub">{alg.tagline}</span>
              )}
            </div>

            <ArrayViz
              step={step}
              reservePointerRow={isSearch}
              onBarClick={isSearch ? setTargetInner : undefined}
            />
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

            {isSearch ? (
              <div className="data-row">
                <label className="field">
                  data
                  <select
                    className="select"
                    value={searchPreset}
                    onChange={(e) =>
                      regenerateSearch(e.target.value as SearchPreset, size)
                    }
                  >
                    {SEARCH_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  n = {size}
                  <input
                    type="range"
                    className="size-range"
                    min={5}
                    max={24}
                    value={size}
                    onChange={(e) =>
                      regenerateSearch(searchPreset, Number(e.target.value))
                    }
                    aria-label="Array size"
                  />
                </label>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => regenerateSearch(searchPreset, size)}
                >
                  new array
                </button>
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
              </div>
            ) : (
              <div className="data-row">
                <label className="field">
                  data
                  <select
                    className="select"
                    value={sortPreset}
                    onChange={(e) =>
                      regenerateSort(e.target.value as Preset, size)
                    }
                  >
                    {PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  n = {size}
                  <input
                    type="range"
                    className="size-range"
                    min={5}
                    max={24}
                    value={size}
                    onChange={(e) =>
                      regenerateSort(sortPreset, Number(e.target.value))
                    }
                    aria-label="Array size"
                  />
                </label>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => regenerateSort(sortPreset, size)}
                >
                  new array
                </button>
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
                <button type="button" className="ghost-btn" onClick={applyCustom}>
                  run it
                </button>
              </div>
            )}
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
