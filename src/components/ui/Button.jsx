import PropTypes from "prop-types";

// Voir docs/02_design_application.md — styles et variantes de bouton
const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary:
    "bg-gradient-to-br from-brand-red via-brand-red to-[#FF8A3D] text-white shadow-[0_14px_35px_rgba(227,53,13,0.28)] hover:-translate-y-0.5 hover:shadow-glow",
  secondary:
    "border border-white/70 bg-white/70 text-brand-black shadow-card backdrop-blur hover:-translate-y-0.5 hover:border-brand-yellow/60",
  ghost: "bg-transparent text-brand-black hover:-translate-y-0.5 hover:bg-white/60",
};

function Button({ variant = "primary", className = "", children, ...props }) {
  const variantClasses = variants[variant] ?? variants.primary;
  const merged = `${baseClasses} ${variantClasses} ${className}`.trim();

  return (
    <button type="button" className={merged} {...props}>
      {children}
    </button>
  );
}

Button.propTypes = {
  variant: PropTypes.oneOf(Object.keys(variants)),
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Button;
