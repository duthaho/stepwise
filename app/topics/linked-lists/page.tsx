import type { Metadata } from "next";
import Link from "next/link";
import { Playground } from "@/components/playground";

export const metadata: Metadata = {
  title: "Linked lists — Stepwise",
  description:
    "Step through pointer surgery: reverse a linked list, find the middle with fast & slow runners, and detect a cycle with Floyd's algorithm.",
};

export default function LinkedListsPage() {
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
        <Playground topic="linked-lists" />
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
