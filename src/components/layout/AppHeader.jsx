// src/components/layout/AppHeader.jsx
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button.jsx";
import TokenCounter from "@/components/domain/TokenCounter.jsx";

function AppHeader({ tokenBalance = 0, onGenerate = () => {} }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur border-b border-white/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Brand / Nav gauche */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-1.5 text-sm font-semibold text-brand-black shadow-card hover:-translate-y-0.5 transition"
          >
            <span className="h-3 w-3 rounded-full bg-brand-yellow inline-block" />
            PokéForge
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/collection"
              className="rounded-xl px-3 py-1.5 text-sm text-brand-gray hover:text-brand-black transition"
            >
              Collection
            </Link>
            <Link
              to="/studio"
              className="rounded-xl px-3 py-1.5 text-sm text-brand-gray hover:text-brand-black transition"
            >
              Studio
            </Link>
            <Link
              to="/market"
              className="rounded-xl px-3 py-1.5 text-sm text-brand-gray hover:text-brand-black transition"
            >
              Marché
            </Link>
          </nav>
        </div>

        {/* Actions droites */}
        <div className="flex items-center gap-3">
          <TokenCounter value={Number.isFinite(tokenBalance) ? tokenBalance : 0} />
          <Button className="px-4 py-2 text-sm" onClick={onGenerate}>
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
