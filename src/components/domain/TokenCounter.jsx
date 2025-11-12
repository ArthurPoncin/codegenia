import PropTypes from "prop-types";

// Voir docs/02_design_application.md — compteur de jetons
function TokenCounter({ value = 0 }) {
  return (
    <div className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-white/60 bg-white/80 px-4 py-2 shadow-card backdrop-blur">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl border border-white/50"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.65)_45%,rgba(255,255,255,0)_75%)] opacity-0 transition duration-500 group-hover:opacity-80 group-hover:animate-shimmer"
      />
      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-yellow via-[#FFD84D] to-[#FFF3C1] shadow-inner">
        <span className="absolute inset-[2px] rounded-full border border-white/60 opacity-80" />
        <span className="relative h-3/5 w-3/5 rounded-full border border-white/70 opacity-60" />
      </span>
      <span className="text-sm font-semibold text-brand-black">{value}</span>
      <span className="text-xs font-medium text-brand-gray">jetons</span>
    </div>
  );
}

TokenCounter.propTypes = {
  value: PropTypes.number,
};

export default TokenCounter;
