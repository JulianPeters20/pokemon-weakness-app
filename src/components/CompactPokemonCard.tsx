import type { Pokemon } from "../types.ts"
import { TypeBadge } from "./TypeBadge.tsx"

interface CompactPokemonCardProps {
  pokemon: Pokemon
  onClear: () => void
  onMarkDead?: () => void
}

export function CompactPokemonCard({ pokemon, onClear, onMarkDead }: CompactPokemonCardProps) {
  const artwork = pokemon.sprites.other["official-artwork"].front_default
  const types = pokemon.types.sort((a, b) => a.slot - b.slot)
  const displayName = pokemon.name.replace(/-/g, " ")

  return (
    <div className="compact-card">
      <button className="compact-card-clear" onClick={onClear} aria-label="Clear Pokémon" title="Remove">
        &times;
      </button>
      {onMarkDead && (
        <button className="compact-card-skull" onClick={onMarkDead} aria-label="Mark as dead" title="Mark as dead">
          💀
        </button>
      )}
      <div className="compact-card-body">
        {artwork && (
          <img
            className="compact-card-sprite"
            src={artwork}
            alt={pokemon.name}
            loading="lazy"
          />
        )}
        <div className="compact-card-info">
          <span className="compact-card-name">{displayName}</span>
          <div className="compact-card-types">
            {types.map((t) => (
              <TypeBadge key={t.type.name} type={t.type.name} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
