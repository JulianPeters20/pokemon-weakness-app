import type { Pokemon } from "../types.ts"
import { TypeBadge } from "./TypeBadge.tsx"

interface MiniPokemonRowProps {
  pokemon: Pokemon
  onRemove?: () => void
  playerLabel?: string
}

export function MiniPokemonRow({ pokemon, onRemove, playerLabel }: MiniPokemonRowProps) {
  const artwork = pokemon.sprites.other["official-artwork"].front_default
  const types = pokemon.types.sort((a, b) => a.slot - b.slot)
  const displayName = pokemon.name.replace(/-/g, " ")

  return (
    <div className="mini-row">
      {playerLabel && <span className="mini-row-player">{playerLabel}</span>}
      {artwork && (
        <img className="mini-row-sprite" src={artwork} alt={pokemon.name} loading="lazy" />
      )}
      <span className="mini-row-name">{displayName}</span>
      <div className="mini-row-types">
        {types.map((t) => (
          <TypeBadge key={t.type.name} type={t.type.name} />
        ))}
      </div>
      {onRemove && (
        <button className="mini-row-remove" onClick={onRemove} aria-label="Remove" title="Remove">
          &times;
        </button>
      )}
    </div>
  )
}
