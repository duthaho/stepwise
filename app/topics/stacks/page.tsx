import type { Metadata } from "next";
import Link from "next/link";
import { Playground } from "@/components/playground";

export const metadata: Metadata = {
  title: "Stacks & queues — Stepwise",
  description:
    "Step through the monotonic stack pattern: next greater element, sliding window maximum, and largest rectangle in a histogram.",
};

export default function StacksPage() {
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
        <Playground topic="stacks" />
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
