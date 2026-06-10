import { Suspense } from "react";
import BookForm from "./BookForm";

export default function BookPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-950 text-slate-100 p-8">Loading booking form...</main>}>
      <BookForm />
    </Suspense>
  );
}
