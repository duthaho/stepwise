"use client";

import { useMemo, useRef, useState } from "react";

const TOKEN_RE =
  /(\/\/.*$)|\b(function|const|let|for|while|if|else|return|break|continue)\b|(\d+(?:\.\d+)?)|([A-Za-z_$][\w$]*(?=\())/gm;

type Tok = { text: string; cls: string };

function tokenizeLine(line: string): Tok[] {
  const toks: Tok[] = [];
  let last = 0;
  TOKEN_RE.lastIndex = 0;
  for (let m = TOKEN_RE.exec(line); m; m = TOKEN_RE.exec(line)) {
    if (m.index > last) toks.push({ text: line.slice(last, m.index), cls: "tk-plain" });
    const cls = m[1] ? "tk-com" : m[2] ? "tk-kw" : m[3] ? "tk-num" : "tk-fn";
    toks.push({ text: m[0], cls });
    last = m.index + m[0].length;
  }
  if (last < line.length) toks.push({ text: line.slice(last), cls: "tk-plain" });
  return toks;
}

export function CodePanel({
  code,
  activeLine,
  title,
}: {
  code: string;
  activeLine: number | null;
  title: string;
}) {
  const lines = useMemo(
    () => code.split("\n").map((l) => tokenizeLine(l)),
    [code],
  );
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable (permissions / http) — leave the label unchanged
    }
  };

  return (
    <section className="card" aria-label={`${title} source code`}>
      <div className="card-head">
        <span className="card-title">{title} · source</span>
        <button
          type="button"
          className={`copy-btn${copied ? " is-copied" : ""}`}
          onClick={copy}
          aria-live="polite"
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <div className="code" role="figure" aria-label="Source with the executing line highlighted">
        {lines.map((toks, i) => (
          <div
            key={i}
            className={`cline${activeLine === i + 1 ? " is-active" : ""}`}
          >
            <span className="cline-no">{i + 1}</span>
            <span className="cline-src">
              {toks.map((t, k) => (
                <span key={k} className={t.cls}>
                  {t.text}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
