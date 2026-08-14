import type { Metadata } from "next";
import Link from "next/link";
import { Playground } from "@/components/playground";

export const metadata: Metadata = {
  title: "Graphs — Stepwise",
  description:
    "Step through BFS, DFS and Dijkstra — watch the frontier expand and shortest-path distances settle on a live graph.",
};

export default function GraphsPage() {
  return (
    <>
      <header className="wrap">
        <nav className="nav" aria-label="Main">
          <Link href="/" className="wordmark">
            stepwise<em>()</em>
          </Link>
          <Link href="/" className="nav-link">
            ← all topics
          </Link>
        </nav>
      </header>

      <main className="wrap">
        <Playground topic="graphs" />
      </main>

      <footer className="foot">
        <div className="wrap">
          <p className="foot-meta">
            stepwise() · every step above came from the code on the left,
            actually running
          </p>
        </div>
      </footer>
    </>
  );
}
