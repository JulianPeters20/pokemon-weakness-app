import { useState, useEffect, useRef, useMemo } from "react"
import { fetchAllPokemonNames, fetchPokemon, fetchPokemonSpecies, fetchTypeData } from "../api.ts"
import { getGenerationFromId, isSupportedGeneration, isMega, extractGeneration } from "../generation.ts"
import { combineDamageRelations, calculateWeaknesses } from "../weakness.ts"
import { getCurrentMoveset } from "../utils/levelUpMoves.ts"
import { calculateUnboundLevelUpMoves } from "../utils/unboundLearnsets.ts"
import type { LevelUpMove } from "../utils/levelUpMoves.ts"
import { PokemonCard } from "./PokemonCard.tsx"
import type { Pokemon, TypeMultiplier } from "../types.ts"

export function PokemonLookupSection() {
  const [value, setValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [allPokemon, setAllPokemon] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [pokemon, setPokemon] = useState<Pokemon | null>(null)
  const [weaknesses, setWeaknesses] = useState<TypeMultiplier[]>([])
  const [generation, setGeneration] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [level, setLevel] = useState("")
  const [levelError, setLevelError] = useState("")

  const levelUpMoves: LevelUpMove[] = useMemo(() => {
    if (!pokemon) return []
    const parsed = Number(level)
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) return []
    return calculateUnboundLevelUpMoves(pokemon.name, parsed)
  }, [pokemon, level])

  const hasUnboundLearnset: boolean = useMemo(() => {
    if (!pokemon) return false
    return calculateUnboundLevelUpMoves(pokemon.name, 100).length > 0
  }, [pokemon])

  const currentMoveset: LevelUpMove[] = useMemo(
    () => getCurrentMoveset(levelUpMoves),
    [levelUpMoves],
  )

  useEffect(() => {
    fetchAllPokemonNames()
      .then((list) => setAllPokemon(list.map((p) => p.name)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (value.trim().length >= 2) {
      const q = value.trim().toLowerCase()
      const filtered = allPokemon
        .filter((name) => !isMega(name))
        .filter((name) => name.includes(q))
        .slice(0, 10)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
      setSelectedIndex(-1)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [value, allPokemon])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const resetResult = () => {
    setPokemon(null)
    setWeaknesses([])
    setGeneration("")
    setError("")
    setLevel("")
    setLevelError("")
  }

  const doSearch = async (name: string) => {
    const trimmed = name.toLowerCase().trim()
    setValue(trimmed)
    setShowSuggestions(false)
    resetResult()

    if (isMega(trimmed)) {
      setError("Mega Pokémon are not supported in Pokémon Unbound.")
      return
    }

    setIsLoading(true)

    try {
      const data = await fetchPokemon(trimmed)

      const speciesUrlParts = data.species.url.replace(/\/$/, "").split("/")
      const speciesId = Number(speciesUrlParts[speciesUrlParts.length - 1])
      const gen = getGenerationFromId(speciesId)

      if (!isSupportedGeneration(gen)) {
        const genLabel = gen ? `Generation ${gen}` : "an unknown generation"
        setError(
          `"${data.name}" is from ${genLabel}, which is not supported in Pokémon Unbound. Only Generations 1–7 are available.`,
        )
        setIsLoading(false)
        return
      }

      const [species, ...typeDatas] = await Promise.all([
        fetchPokemonSpecies(speciesId).catch(() => null),
        ...data.types.map((t) => fetchTypeData(t.type.name)),
      ])

      const multipliers = combineDamageRelations(
        typeDatas.map((td) => td.damage_relations),
      )

      setPokemon(data)
      setWeaknesses(calculateWeaknesses(multipliers))
      setGeneration(species ? extractGeneration(species.generation.url) : "Unknown")
    } catch (err) {
      const message =
        err instanceof TypeError
          ? "Network error — unable to reach PokéAPI. Please check your internet connection."
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) doSearch(trimmed)
  }

  const selectSuggestion = (name: string) => {
    doSearch(name)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[selectedIndex])
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  return (
    <section className="lookup-section">
      <div className="lookup-header">
        <h2 className="lookup-title">Battle Helper</h2>
        <p className="lookup-subtitle">
          Look up any Pokémon to check its stats, type matchups, and weaknesses. 
          This is informational only — it does not affect your active team, Graveyard, Box, or encounter checklist.
        </p>
      </div>

      <div className="search-wrapper" ref={wrapperRef}>
        <form className="search-form" onSubmit={handleSubmit}>
          <input
            className="search-input"
            type="text"
            placeholder="Search Pokémon (e.g. pikachu, charizard)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
            disabled={isLoading}
            autoComplete="off"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
          />
          <button className="search-button" type="submit" disabled={isLoading || !value.trim()}>
            {isLoading ? "Searching..." : "Search"}
          </button>
        </form>
        {showSuggestions && (
          <ul className="suggestions-list" role="listbox">
            {suggestions.map((name, i) => (
              <li
                key={name}
                role="option"
                aria-selected={i === selectedIndex}
                className={`suggestion-item ${i === selectedIndex ? "selected" : ""}`}
                onMouseDown={() => selectSuggestion(name)}
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isLoading && (
        <div className="state-message">
          <div className="spinner" />
          <p>Loading Pokémon data...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="state-message error">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && !pokemon && (
        <div className="state-message">
          <p>Search for a Pokémon above to see its details here.</p>
        </div>
      )}

      {!isLoading && !error && pokemon && (
        <>
          <PokemonCard
            pokemon={pokemon}
            generation={generation}
            weaknesses={weaknesses}
          />

          <div className="lookup-moves">
            <div className="lookup-level-row">
              <label className="lookup-level-label">
                Level
                <input
                  className="lookup-level-input"
                  type="number"
                  min={1}
                  max={100}
                  value={level}
                  onChange={(e) => {
                    const raw = e.target.value
                    setLevel(raw)
                    setLevelError("")
                    if (raw === "") return
                    const parsed = Number(raw)
                    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
                      setLevelError("Enter a level between 1 and 100.")
                    }
                  }}
                  placeholder="e.g. 50"
                />
              </label>
            </div>
            {levelError && <p className="lookup-level-error">{levelError}</p>}

            {level !== "" && !levelError && levelUpMoves.length > 0 && (
              <div className="lookup-moveset">
                <div className="lookup-moveset-header">
                  <h3 className="lookup-moveset-title">Current Moveset</h3>
                  <span className="lookup-moveset-note">
                    {hasUnboundLearnset
                      ? "Pokémon Unbound learnset"
                      : "Reference data — official, may differ from Pokémon Unbound"}
                  </span>
                </div>
                <div className="moveset-grid">
                  {currentMoveset.map((m) => (
                    <div key={m.name} className="moveset-card">
                      <span className="moveset-card-name">{m.name.replace(/-/g, " ")}</span>
                      <span className="moveset-card-level">Lv. {m.level}</span>
                    </div>
                  ))}
                </div>

                {levelUpMoves.length > 4 && (
                  <details className="lookup-all-moves">
                    <summary className="lookup-all-moves-summary">
                      All Level-Up Moves ({levelUpMoves.length})
                    </summary>
                    <div className="lookup-all-moves-list">
                      {levelUpMoves.map((m) => (
                        <div key={m.name} className="lookup-all-move-row">
                          <span className="lookup-all-move-name">{m.name.replace(/-/g, " ")}</span>
                          <span className="lookup-all-move-level">Lv. {m.level}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}

            {level !== "" && !levelError && levelUpMoves.length === 0 && (
              <p className="lookup-moves-empty">
                {hasUnboundLearnset
                  ? `No level-up moves found at level ${level}.`
                  : "No Pokémon Unbound learnset available for this Pokémon."}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  )
}
