// Voir docs/02_design_application.md — compteur de jetons
function TokenCounter({ value = 0 }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-1 shadow-card">
      <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-brand-yellow" />
      <span className="text-sm font-semibold text-brand-black">{value}</span>
      <span className="text-xs text-brand-gray">jetons</span>
function TokenCounter() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm">
      <span className="font-semibold text-slate-700">Jetons</span>
      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-900">
        100
      </span>
    </div>
  );
}

export default TokenCounter;
