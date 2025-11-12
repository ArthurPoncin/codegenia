function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 border-t border-white/60 bg-white/60 py-10 text-sm text-brand-gray backdrop-blur">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-yellow/80 to-transparent"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-4">
        <div className="space-y-1">
          <span className="font-semibold text-brand-black">© {year} PokéForge</span>
          <p className="text-xs text-brand-gray">
            Atelier de génération Pokémon — forge tes compagnons et collectionne-les avec style.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a href="#mentions" className="hover:text-brand-black">
            Mentions légales
          </a>
          <a href="#accessibilite" className="hover:text-brand-black">
            Accessibilité
          </a>
          <span className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold text-brand-gray">
            v0.0.1
          </span>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
