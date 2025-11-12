import Badge from "@/components/ui/Badge.jsx";
import Button from "@/components/ui/Button.jsx";

// Voir docs/02_design_application.md — carte Pokémon
function PokemonCard({
  name,
  imageUrl,
  createdAt,
  rarity,
  onSell,
  actions = null,
}) {
  const formattedDate = createdAt ? new Date(createdAt).toLocaleString() : "";

  return (
    <article className="group relative rounded-2xl bg-white p-3 shadow-card transition hover:shadow-lift">
      <div className="aspect-square overflow-hidden rounded-xl bg-surface-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="h-full w-full animate-pulse bg-gradient-to-br from-surface-100 via-surface-200 to-surface-100" />
        )}
      </div>
      <header className="mt-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-brand-black">{name}</h3>
          {formattedDate && (
            <time className="text-xs text-brand-gray" dateTime={new Date(createdAt).toISOString()}>
              {formattedDate}
            </time>
          )}
        </div>
        {rarity && <Badge tone={rarity}>{rarity}</Badge>}
      </header>
      <footer className="mt-3 flex items-center justify-between gap-2">
        {onSell ? (
          <Button
            variant="ghost"
            className="text-sm text-brand-blue hover:text-brand-blue"
            onClick={onSell}
            aria-label={`Revendre ${name}`}
          >
            Revendre (+5)
          </Button>
        ) : (
          <span className="text-xs text-brand-gray">Revendre indisponible</span>
        )}
        {actions}
      </footer>
    </article>
  );
}

export default PokemonCard;
