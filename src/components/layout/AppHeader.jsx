import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import Button from "@/components/ui/Button.jsx";
import TokenCounter from "@/components/domain/TokenCounter.jsx";

const navLinkClass = ({ isActive }) =>
  `relative inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 sm:text-sm ${
    isActive
      ? "bg-gradient-to-br from-brand-red via-brand-red to-[#FF8A3D] text-white shadow-card"
      : "text-brand-gray hover:bg-white/70 hover:text-brand-black"
  }`;

// Voir docs/02_design_application.md — header principal
function AppHeader({ tokenBalance = 0, onGenerate }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-2xl px-2 py-1 text-brand-black transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
        >
          <img src="/favicon.svg" alt="PokéForge" className="h-9 w-9" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight">PokéForge</span>
            <span className="text-xs font-medium uppercase tracking-[0.4em] text-brand-gray">Forge Studio</span>
          </div>
        </Link>
        <nav
          className="flex items-center gap-2 overflow-hidden rounded-full border border-white/60 bg-white/60 px-1 py-1 text-xs shadow-card backdrop-blur sm:text-sm"
          aria-label="Navigation principale"
        >
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
        <div className="ml-auto flex items-center gap-3">
          <TokenCounter value={tokenBalance} />
          <Button className="hidden sm:inline-flex" onClick={onGenerate}>
            Générer
          </Button>
          <Button className="sm:hidden" variant="secondary" onClick={onGenerate}>
            Générer
          </Button>
        </div>
      </div>
    </header>
  );
}

AppHeader.propTypes = {
  tokenBalance: PropTypes.number,
  onGenerate: PropTypes.func,
};

export default AppHeader;
