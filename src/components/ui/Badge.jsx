// Voir docs/02_design_application.md — badge de rareté
const toneMap = {
  common: "bg-surface-200 text-brand-black",
  rare: "bg-brand-blue text-white",
  epic: "bg-brand-yellow text-brand-black",
  legendary: "bg-gradient-to-r from-brand-red to-brand-yellow text-black",
};

function Badge({ tone = "common", children, className = "" }) {
  const palette = toneMap[tone] ?? toneMap.common;
  const merged = `inline-block rounded px-2 py-1 text-xs font-semibold ${palette} ${className}`.trim();

  return <span className={merged}>{children}</span>;
}

export default Badge;
