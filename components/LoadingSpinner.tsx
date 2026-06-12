export default function LoadingSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="relative h-14 w-14 rounded-full border border-cyan-400/30 bg-slate-900/80 shadow-2xl shadow-cyan-500/10" aria-label="Loading">
        <span className="absolute inset-0 rounded-full border border-transparent border-t-cyan-300 animate-spin" />
        <span className="absolute inset-2 rounded-full border border-transparent border-t-violet-300 animate-spin [animation-direction:reverse] [animation-duration:1.4s]" />
      </div>
    </div>
  );
}
