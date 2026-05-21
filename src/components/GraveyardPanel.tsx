import { useState } from "react"
import type { Pokemon } from "../types.ts"
import { PokemonSearch } from "./PokemonSearch.tsx"
import { CompactPokemonCard } from "./CompactPokemonCard.tsx"

export interface GraveyardEntry {
  id: string
  name: string
  pokemon: Pokemon | null
  player: "player1" | "player2"
  isLoading: boolean
  error: string
  timestamp: number
}

interface GraveyardPanelProps {
  player: "player1" | "player2"
  entries: GraveyardEntry[]
  onAdd: (name: string) => void
  onRemove: (id: string) => void
  lockedNames: Set<string>
  deadNames: Set<string>
  activeNames: Set<string>
  boxedNames: Set<string>
}

const PLAYER_LABEL: Record<string, string> = {
  player1: "Player 1",
  player2: "Player 2",
}

export function GraveyardPanel({ player, entries, onAdd, onRemove, lockedNames, deadNames, activeNames, boxedNames }: GraveyardPanelProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [searchError, setSearchError] = useState("")

  const getBlockError = (name: string): string => {
    const normalized = name.toLowerCase().trim()
    if (deadNames.has(normalized)) return `"${name}" is already in a Graveyard.`
    if (activeNames.has(normalized)) return `"${name}" is in an active team slot.`
    if (boxedNames.has(normalized)) return `"${name}" is in the Box.`
    return `"${name}" evolution line is in a Graveyard.`
  }

  const handleSelect = (name: string) => {
    const normalized = name.toLowerCase().trim()
    if (lockedNames.has(normalized)) {
      setSearchError(getBlockError(name))
      return
    }
    setShowSearch(false)
    setSearchError("")
    onAdd(name)
  }

  const handleCancel = () => {
    setShowSearch(false)
    setSearchError("")
  }

  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="graveyard-panel">
      <div className="graveyard-header">
        <h3 className="graveyard-title">{PLAYER_LABEL[player]} Graveyard</h3>
        <span className="graveyard-count">{entries.length}</span>
      </div>

      {showSearch ? (
        <div className="graveyard-search-area">
          <PokemonSearch
            onSelect={handleSelect}
            onCancel={handleCancel}
            error={searchError}
            placeholder="Search dead Pokémon..."
            lockedNames={lockedNames}
            deadNames={deadNames}
            activeNames={activeNames}
            boxedNames={boxedNames}
          />
        </div>
      ) : (
        <button
          className="graveyard-add-btn"
          onClick={() => setShowSearch(true)}
          type="button"
        >
          + Add Dead Pokémon
        </button>
      )}

      {sorted.length === 0 && !showSearch && (
        <p className="graveyard-empty">No dead Pokémon tracked yet.</p>
      )}

      <div className="graveyard-list">
        {sorted.map((entry) => (
          <div key={entry.id} className="graveyard-entry">
            {entry.isLoading ? (
              <div className="graveyard-entry-loading">
                <div className="spinner-small" />
                <span>Loading {entry.name}...</span>
              </div>
            ) : entry.error ? (
              <div className="graveyard-entry-error">
                <span className="graveyard-entry-name">{entry.name}</span>
                <span className="graveyard-entry-errmsg">{entry.error}</span>
                <button
                  className="graveyard-entry-remove"
                  onClick={() => onRemove(entry.id)}
                  aria-label="Remove"
                >
                  &times;
                </button>
              </div>
            ) : entry.pokemon ? (
              <CompactPokemonCard
                pokemon={entry.pokemon}
                onClear={() => onRemove(entry.id)}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
