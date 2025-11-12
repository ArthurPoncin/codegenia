const baseStyles =
  "inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60";

function Button({ children, className = "", ...props }) {
  return (
    <button className={`${baseStyles} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export default Button;
