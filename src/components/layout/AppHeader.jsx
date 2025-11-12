import { Link, NavLink } from "react-router-dom";
import Button from "@/components/ui/Button.jsx";
import TokenCounter from "@/components/domain/TokenCounter.jsx";

const navLinkClass = ({ isActive }) =>
  `rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${
    isActive
      ? "bg-brand-red text-white shadow-card"
      : "text-brand-gray hover:bg-surface-100 hover:text-brand-black"
  }`;

// Voir docs/02_design_application.md — header principal
function AppHeader({ tokenBalance = 0, onGenerate }) {
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
        <div className="ml-auto flex items-center gap-3">
          <TokenCounter value={tokenBalance} />
          <Button onClick={onGenerate}>Générer</Button>
        </div>
        <TokenCounter />
      </div>
    </header>
  );
}

export default AppHeader;
