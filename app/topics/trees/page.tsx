import type { Metadata } from "next";
import Link from "next/link";
import { Playground } from "@/components/playground";

export const metadata: Metadata = {
  title: "Trees — Stepwise",
  description:
    "Step through binary search trees: insert, search, and in-order traversal — drawn as the tree grows and the walk descends.",
};

export default function TreesPage() {
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
        <Playground topic="trees" />
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
