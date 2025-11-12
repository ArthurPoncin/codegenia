import { useMemo, useState } from "react";
import Button from "@/components/ui/Button.jsx";
import { useGeneratePokemon } from "@/features/pokemons/useGeneratePokemon.js";

const DEFAULT_PROMPT = "A new electric fox-like Pokémon, anime style";

function GeneratorButton({ mode = "server", onGenerated, pollingOptions }) {
  const [prompt, setPrompt] = useState("");
  const { status, error, generate, reset } = useGeneratePokemon({ mode });
  const busy = status === "queued" || status === "running";

  const helperText = useMemo(
    () => "100 jetons au départ · −10 par génération · +5 à la revente",
    []
  );

  async function handleSubmit(event) {
    event.preventDefault();
    const finalPrompt = prompt.trim() || DEFAULT_PROMPT;
    try {
      const result = await generate(
        { prompt: finalPrompt },
        { pollingOptions }
      );
      onGenerated?.(result);
      setPrompt("");
    } catch (err) {
      console.error("[GeneratorButton] Generation failed", err);
    }
  }

  function handlePromptChange(event) {
    if (status === "failed") {
      reset();
    }
    setPrompt(event.target.value);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} aria-live="polite">
      <label className="block text-sm font-medium text-brand-gray" htmlFor="generator-prompt">
        Décris ton Pokémon
      </label>
      <textarea
        id="generator-prompt"
        name="prompt"
        value={prompt}
        onChange={handlePromptChange}
        placeholder={DEFAULT_PROMPT}
        rows={3}
        className="w-full resize-none rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
        disabled={busy}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy} aria-busy={busy}>
          {busy ? "Génération en cours…" : "Générer (−10)"}
        </Button>
        <p className="text-sm text-brand-gray">{helperText}</p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-brand-red">
          {error.message || "La génération a échoué. Réessayez dans un instant."}
        </p>
      )}
    </form>
  );
}

export default GeneratorButton;
