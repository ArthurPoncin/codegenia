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
