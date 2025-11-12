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
