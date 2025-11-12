const baseClasses =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-brand-red text-white hover:-translate-y-px hover:shadow-card",
  secondary: "bg-white text-brand-black border border-surface-200 hover:bg-surface-100",
  ghost: "bg-transparent text-brand-black hover:bg-surface-100",
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
