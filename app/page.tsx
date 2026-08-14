import Link from "next/link";

const TOPICS: {
  name: string;
  desc: string;
  href?: string;
  count?: string;
}[] = [
  {
    name: "Sorting",
    desc: "Bubble, insertion, selection, merge, quick — watch elements slide into place.",
    href: "/topics/sorting",
    count: "5 algorithms",
  },
  {
    name: "Searching",
    desc: "Linear, binary, lower bound — and the invariants that make binary search hard to get right.",
    href: "/topics/searching",
    count: "3 algorithms",
  },
  {
    name: "Linked lists",
    desc: "Pointer surgery, slow/fast runners, cycle detection.",
  },
  {
    name: "Stacks & queues",
    desc: "Monotonic stacks and the problems they quietly solve.",
  },
  {
    name: "Trees",
    desc: "Traversals, BST operations, balancing — drawn as they recurse.",
  },
  {
    name: "Graphs",
    desc: "BFS, DFS, Dijkstra — the frontier, animated.",
  },
  {
    name: "Dynamic programming",
    desc: "Watch the table fill and the subproblems collapse.",
  },
];

export default function Home() {
  return (
    <>
      <header className="wrap">
        <nav className="nav" aria-label="Main">
          <Link href="/" className="wordmark">
            stepwise<em>()</em>
          </Link>
          <Link href="/topics/sorting" className="nav-link">
            topics ↓
          </Link>
        </nav>
      </header>

      <main className="wrap">
        <section className="hero reveal" style={{ ["--i" as string]: 0 }}>
          <h1 className="hero-title">
            Watch the code <em>run</em>.
          </h1>
          <p className="hero-lede">
            Every topic is real code you can step through line by line, with a
            visualization that moves in lockstep. Scrub it, slow it down, feed
            it your own input — until the algorithm stops being memorized and
            starts being obvious.
          </p>
          <Link href="/topics/sorting" className="hero-cta">
            step through sorting →
          </Link>
        </section>

        <section className="topics" aria-label="Topics">
          <h2 className="topics-head reveal" style={{ ["--i" as string]: 1 }}>
            Topics
          </h2>
          {TOPICS.map((t, i) =>
            t.href ? (
              <Link
                key={t.name}
                href={t.href}
                className="topic-row is-live reveal"
                style={{ ["--i" as string]: Math.min(i + 2, 8) }}
              >
                <span className="topic-name">{t.name}</span>
                <span className="topic-desc">{t.desc}</span>
                <span className="topic-status">{t.count}</span>
              </Link>
            ) : (
              <div
                key={t.name}
                className="topic-row is-soon reveal"
                style={{ ["--i" as string]: Math.min(i + 2, 8) }}
              >
                <span className="topic-name">{t.name}</span>
                <span className="topic-desc">{t.desc}</span>
                <span className="topic-status">soon</span>
              </div>
            ),
          )}
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <p className="foot-statement">
            Understanding is watching it happen.
          </p>
          <p className="foot-meta">stepwise() · built for people who’d rather see it than memorize it</p>
        </div>
      </footer>
    </>
  );
}
