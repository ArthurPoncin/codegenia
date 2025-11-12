import PropTypes from "prop-types";

// Voir docs/02_design_application.md — badge de rareté
const toneMap = {
  common: "border border-white/60 bg-white/70 text-brand-black",
  rare: "border border-brand-blue/40 bg-brand-blue/90 text-white",
  epic: "border border-brand-yellow/60 bg-brand-yellow/90 text-brand-black",
  legendary:
    "border border-brand-red/60 bg-gradient-to-r from-brand-red via-brand-red to-brand-yellow text-brand-black shadow-card",
};

function Badge({ tone = "common", children, className = "" }) {
  const palette = toneMap[tone] ?? toneMap.common;
  const merged = `inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur ${palette} ${className}`.trim();

  return <span className={merged}>{children}</span>;
}

Badge.propTypes = {
  tone: PropTypes.oneOf(Object.keys(toneMap)),
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Badge;
