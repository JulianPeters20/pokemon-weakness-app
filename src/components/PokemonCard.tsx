import type { Pokemon, TypeMultiplier } from "../types.ts"
import { TypeBadge } from "./TypeBadge.tsx"
import { StatBar } from "./StatBar.tsx"

interface PokemonCardProps {
  pokemon: Pokemon
  generation: string
  weaknesses: TypeMultiplier[]
}

export function PokemonCard({ pokemon, generation, weaknesses }: PokemonCardProps) {
  const artwork = pokemon.sprites.other["official-artwork"].front_default
  const types = pokemon.types.sort((a, b) => a.slot - b.slot)

  const grouped = weaknesses.reduce<Record<string, TypeMultiplier[]>>((acc, w) => {
    const key = String(w.multiplier)
    if (!acc[key]) acc[key] = []
    acc[key].push(w)
    return acc
  }, {})

  const sortedKeys = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="pokemon-card">
      <div className="card-header">
        <div className="card-title-row">
          <h2 className="pokemon-name">{pokemon.name}</h2>
          <span className="pokemon-id">#{String(pokemon.id).padStart(4, "0")}</span>
        </div>
        <span className="pokemon-gen">{generation}</span>
      </div>

      <div className="card-body">
        <div className="card-left">
          {artwork && (
            <img
              className="pokemon-sprite"
              src={artwork}
              alt={pokemon.name}
              loading="lazy"
            />
          )}
          <div className="type-row">
            {types.map((t) => (
              <TypeBadge key={t.type.name} type={t.type.name} />
            ))}
          </div>
        </div>

        <div className="card-right">
          <section className="stats-section">
            <h3>Base Stats</h3>
            <div className="stats-grid">
              {pokemon.stats.map((s) => (
                <StatBar key={s.stat.name} statName={s.stat.name} value={s.base_stat} />
              ))}
            </div>
            <div className="stat-total">
              Total: {pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)}
            </div>
          </section>

          <section className="weakness-section">
            <h3>Type Matchups</h3>
            <div className="weakness-groups">
              {sortedKeys.map((key) => {
                const mult = Number(key)
                const label =
                  mult === 0
                    ? "Immune"
                    : mult === 0.25
                      ? "Resists (¼×)"
                      : mult === 0.5
                        ? "Resists (½×)"
                        : mult === 2
                          ? "Weak (2×)"
                          : mult === 4
                            ? "Weak (4×)"
                            : "Normal"
                return (
                  <div key={key} className="weakness-group">
                    <span className="weakness-label">{label}</span>
                    <div className="weakness-badges">
                      {grouped[key].map((w) => (
                        <TypeBadge key={w.type} type={w.type} multiplier={w.multiplier} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
