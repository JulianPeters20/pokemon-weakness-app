import { useState, useEffect } from "react"
import { EmptyPokemonSlot } from "./EmptyPokemonSlot.tsx"
import { PokemonSearch } from "./PokemonSearch.tsx"
import { CompactPokemonCard } from "./CompactPokemonCard.tsx"
import type { SoulLinkSlotData } from "../types.ts"

interface SoulLinkSlotProps {
  data: SoulLinkSlotData
  onSelectPokemon: (player: "player1" | "player2", name: string) => void
  onClearPokemon: (player: "player1" | "player2") => void
  lockedNames: Set<string>
  deadNames: Set<string>
  activeNames: Set<string>
  boxedNames: Set<string>
  onMarkSlotDead: (slotIndex: number) => void
}

export function SoulLinkSlot({ data, onSelectPokemon, onClearPokemon, lockedNames, deadNames, activeNames, boxedNames, onMarkSlotDead }: SoulLinkSlotProps) {
  const [searchingFor, setSearchingFor] = useState<"player1" | "player2" | null>(null)
  const [confirmDeath, setConfirmDeath] = useState(false)

  useEffect(() => {
    if (searchingFor && data[searchingFor].pokemon) {
      setSearchingFor(null)
    }
  }, [data, searchingFor])

  const handleMarkDead = () => {
    setConfirmDeath(true)
  }

  const confirmMarkDead = () => {
    setConfirmDeath(false)
    onMarkSlotDead(data.slotNumber - 1)
  }

  const cancelMarkDead = () => {
    setConfirmDeath(false)
  }

  const renderPlayer = (player: "player1" | "player2") => {
    const slotEntry = data[player]
    const isSearching = searchingFor === player
    const playerLabel = player === "player1" ? "Player 1" : "Player 2"

    if (confirmDeath) {
      return (
        <div className="player-area" key={player}>
          <span className="player-label">{playerLabel}</span>
          <div className="death-confirm">
            <span className="death-confirm-text">Mark this linked pair as dead? Both linked Pokémon will be moved to the Graveyard.</span>
            <div className="death-confirm-buttons">
              <button className="death-confirm-yes" onClick={confirmMarkDead}>Yes, they died</button>
              <button className="death-confirm-no" onClick={cancelMarkDead}>Cancel</button>
            </div>
          </div>
        </div>
      )
    }

    if (isSearching) {
      return (
        <div className="player-area" key={player}>
          <span className="player-label">{playerLabel}</span>
          {slotEntry.isLoading ? (
            <div className="search-loading">
              <div className="spinner-small" />
              <p>Loading Pokémon data...</p>
            </div>
          ) : (
            <PokemonSearch
              onSelect={(name) => onSelectPokemon(player, name)}
              onCancel={() => setSearchingFor(null)}
              error={slotEntry.error}
              placeholder={`Search ${playerLabel}'s Pokémon...`}
              lockedNames={lockedNames}
              deadNames={deadNames}
              activeNames={activeNames}
              boxedNames={boxedNames}
            />
          )}
        </div>
      )
    }

    if (slotEntry.pokemon) {
      return (
        <div className="player-area" key={player}>
          <span className="player-label">{playerLabel}</span>
          <CompactPokemonCard
            pokemon={slotEntry.pokemon}
            onClear={() => onClearPokemon(player)}
            onMarkDead={handleMarkDead}
          />
        </div>
      )
    }

    return (
      <div className="player-area" key={player}>
        <span className="player-label">{playerLabel}</span>
        <EmptyPokemonSlot
          playerLabel={`${playerLabel}'s`}
          onClick={() => setSearchingFor(player)}
        />
      </div>
    )
  }

  return (
    <div className="soul-link-slot">
      <div className="slot-header">
        <span className="slot-number">Slot {data.slotNumber}</span>
      </div>
      <div className="slot-players">
        {renderPlayer("player1")}
        {renderPlayer("player2")}
      </div>
    </div>
  )
}
