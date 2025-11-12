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
      </div>
    </footer>
  );
}

export default AppFooter;
