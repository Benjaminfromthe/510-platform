import { Suspense } from "react";
import CampusBookForm from "./CampusBookForm";

export default function BookPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Loading…</p>
      </main>
    }>
      <CampusBookForm />
    </Suspense>
  );
}
