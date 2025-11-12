import { Link, NavLink } from "react-router-dom";
import TokenCounter from "@/components/domain/TokenCounter.jsx";

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-full transition-colors duration-150 ${
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"
  }`;

function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/favicon.svg" alt="PokéForge" className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-wide">PokéForge</span>
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/" className={navLinkClass} end>
            Accueil
          </NavLink>
          <NavLink to="/collection" className={navLinkClass}>
            Collection
          </NavLink>
          <NavLink to="/settings" className={navLinkClass}>
            Réglages
          </NavLink>
        </nav>
        <TokenCounter />
      </div>
    </header>
  );
}

export default AppHeader;
