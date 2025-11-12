import { Link, NavLink } from "react-router-dom";
import TokenCounter from "@/components/domain/TokenCounter.jsx";
import { useTokens } from "@/features/tokens/useTokens.js";

const navLinkClass = ({ isActive }) =>
  `rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${
    isActive
      ? "bg-brand-red text-white shadow-card"
      : "text-brand-gray hover:bg-surface-100 hover:text-brand-black"
  }`;

function AppHeader() {
  const { balance } = useTokens();

  return (
    <header className="sticky top-0 z-40 border-b border-surface-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-2 py-1 text-brand-black transition hover:bg-surface-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
        >
          <img src="/favicon.svg" alt="PokéForge" className="h-9 w-9" />
          <span className="text-lg font-bold tracking-tight">PokéForge</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink to="/" end className={navLinkClass}>
            Accueil
          </NavLink>
          <NavLink to="/collection" className={navLinkClass}>
            Collection
          </NavLink>
          <NavLink to="/settings" className={navLinkClass}>
            Paramètres
          </NavLink>
        </nav>
        <div className="ml-auto">
          <TokenCounter value={balance ?? 0} />
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
