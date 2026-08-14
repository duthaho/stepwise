import type { Metadata } from "next";
import Link from "next/link";
import { Playground } from "@/components/playground";

export const metadata: Metadata = {
  title: "Searching — Stepwise",
  description:
    "Step through linear search, binary search and lower bound line by line — watch the candidate window shrink and the pointers move.",
};

export default function SearchingPage() {
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
        <Playground topic="searching" />
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
