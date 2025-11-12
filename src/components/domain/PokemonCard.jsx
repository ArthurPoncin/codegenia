import PropTypes from "prop-types";
import Badge from "@/components/ui/Badge.jsx";
import Button from "@/components/ui/Button.jsx";

function PokemonCard({
  name,
  imageUrl,
  createdAt,
  rarity,
  onSell,
  isSelling = false,
  actions = null,
}) {
  const formattedDate = createdAt ? new Date(createdAt).toLocaleString() : "";

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-4 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift backdrop-blur">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-card-shine opacity-0 transition duration-300 group-hover:opacity-80"
      />
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="h-full w-full animate-pulse bg-gradient-to-br from-surface-100 via-surface-200 to-surface-100" />
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_65%)] opacity-0 transition duration-300 group-hover:opacity-70"
        />
      </div>
      <header className="mt-4 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-brand-black">{name}</h3>
          {formattedDate && (
            <time className="text-xs text-brand-gray" dateTime={new Date(createdAt).toISOString()}>
              {formattedDate}
            </time>
          )}
        </div>
        {rarity && <Badge tone={rarity} className="shadow-card">{rarity}</Badge>}
      </header>
      <footer className="mt-4 flex items-center justify-between gap-2 text-sm">
        {onSell ? (
          <Button
            variant="ghost"
            className="px-0 text-brand-blue hover:text-brand-blue"
            onClick={onSell}
            aria-label={`Revendre ${name}`}
            disabled={isSelling}
            aria-busy={isSelling}
          >
            {isSelling ? "Revente…" : "Revendre (+5)"}
          </Button>
        ) : (
          <span className="text-xs text-brand-gray">Revendre indisponible</span>
        )}
        <div className="flex items-center gap-2 text-xs text-brand-gray">{actions}</div>
      </footer>
    </article>
  );
}

PokemonCard.propTypes = {
  name: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
  rarity: PropTypes.string,
  onSell: PropTypes.func,
  actions: PropTypes.node,
};

export default PokemonCard;
