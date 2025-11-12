import GeneratorButton from "@/components/domain/GeneratorButton.jsx";
import PokemonGrid from "@/components/domain/PokemonGrid.jsx";
import TokenCounter from "@/components/domain/TokenCounter.jsx";
import { useTokens } from "@/features/tokens/useTokens.js";

function Home() {
  const { balance } = useTokens();

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-black">Bienvenue sur PokéForge</h1>
          <p className="text-sm text-brand-gray">
            Forge des Pokémon uniques en décrivant tes idées. Chaque génération coûte 10 jetons.
          </p>
        </div>
        <div className="ml-auto">
          <TokenCounter value={balance ?? 0} />
        </div>
      </header>

      <GeneratorButton />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-brand-black">Dernières créations</h2>
        <PokemonGrid />
      </div>
    </section>
  );
}

export default Home;
