import { useState } from "react"
import { fetchPokemon, fetchPokemonSpecies, fetchTypeData } from "./api.ts"
import { combineDamageRelations, calculateWeaknesses } from "./weakness.ts"
import { SearchBar } from "./components/SearchBar.tsx"
import { PokemonCard } from "./components/PokemonCard.tsx"
import type { Pokemon, TypeMultiplier } from "./types.ts"

function extractGeneration(url: string): string {
  const parts = url.replace(/\/$/, "").split("/")
  const genId = Number(parts[parts.length - 1])
  const names: Record<number, string> = {
    1: "Generation I",
    2: "Generation II",
    3: "Generation III",
    4: "Generation IV",
    5: "Generation V",
    6: "Generation VI",
    7: "Generation VII",
    8: "Generation VIII",
    9: "Generation IX",
  }
  return names[genId] ?? `Generation ${genId}`
}

export function App() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null)
  const [weaknesses, setWeaknesses] = useState<TypeMultiplier[]>([])
  const [generation, setGeneration] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async (query: string) => {
    setIsLoading(true)
    setError("")
    setPokemon(null)
    setWeaknesses([])
    setGeneration("")

    try {
      const data = await fetchPokemon(query)
      setPokemon(data)

      const [species, ...typeDatas] = await Promise.all([
        fetchPokemonSpecies(data.id),
        ...data.types.map((t) => fetchTypeData(t.type.name)),
      ])

      setGeneration(extractGeneration(species.generation.url))

      const multipliers = combineDamageRelations(
        typeDatas.map((td) => td.damage_relations),
      )
      setWeaknesses(calculateWeaknesses(multipliers))
    } catch (err) {
      if (err instanceof TypeError) {
        setError("Network error — unable to reach PokéAPI. Please check your internet connection.")
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Pokémon Weakness App</h1>
        <p className="app-subtitle">Search any Pokémon to see stats and type matchups</p>
      </header>

      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      {isLoading && (
        <div className="state-message">
          <div className="spinner" />
          <p>Loading Pokémon data...</p>
        </div>
      )}

      {error && (
        <div className="state-message error">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && !pokemon && (
        <div className="state-message empty">
          <p>Enter a Pokémon name or number above to get started.</p>
        </div>
      )}

      {pokemon && !isLoading && (
        <PokemonCard
          pokemon={pokemon}
          generation={generation}
          weaknesses={weaknesses}
        />
      )}
    </div>
  )
}
