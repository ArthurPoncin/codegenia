// Voir docs/02_design_application.md — footer
function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-surface-200 bg-white/80 py-6 text-sm text-brand-gray">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4">
        <span>© {year} PokéForge</span>
        <div className="flex items-center gap-4">
          <a href="#mentions" className="hover:text-brand-black">
            Mentions légales
          </a>
          <span className="text-xs">v0.0.1</span>
        </div>
function AppFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/90 py-6">
      <div className="container mx-auto w-full max-w-5xl px-4 text-sm text-slate-500">
        © {new Date().getFullYear()} PokéForge — Générateur de Pokémon imaginaires.
      </div>
    </footer>
  );
}

export default AppFooter;
