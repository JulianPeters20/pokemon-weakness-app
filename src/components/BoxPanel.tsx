import { useState } from "react"
import type { BoxPairData } from "../types.ts"
import { CompactPokemonCard } from "./CompactPokemonCard.tsx"
import { EmptyPokemonSlot } from "./EmptyPokemonSlot.tsx"
import { BoxPairEditor } from "./BoxPairEditor.tsx"

interface BoxPanelProps {
  boxPairs: BoxPairData[]
  lockedNames: Set<string>
  evoLockedNames: Set<string>
  deadNames: Set<string>
  activeNames: Set<string>
  boxedNames: Set<string>
  onAddBoxPair: (p1Name: string, p2Name: string, route: string, notes: string) => void
  onRemoveBoxPair: (id: string) => void
  onMarkBoxPairDead: (id: string) => void
  onActivateReservePair: (id: string) => void
  hasEmptySlot: boolean
}

function getActivationBlockReason(
  pair: BoxPairData,
  evoLockedNames: Set<string>,
  activeNames: Set<string>,
): string | null {
  for (const p of [pair.player1, pair.player2]) {
    const name = p.pokemon?.name?.toLowerCase()
    if (!name) return "Pair data not fully loaded"
    if (evoLockedNames.has(name)) return `"${p.pokemon!.name}" evolution line is locked (in Graveyard)`
    if (activeNames.has(name)) return `"${p.pokemon!.name}" is already on the active team`
  }
  return null
}

export function BoxPanel({ boxPairs, lockedNames, evoLockedNames, deadNames, activeNames, boxedNames, onAddBoxPair, onRemoveBoxPair, onMarkBoxPairDead, onActivateReservePair, hasEmptySlot }: BoxPanelProps) {
  const [showEditor, setShowEditor] = useState(false)
  const [confirmDeadId, setConfirmDeadId] = useState<string | null>(null)

  const handleMarkDead = (id: string) => {
    setConfirmDeadId(id)
  }

  const confirmMarkDead = () => {
    if (confirmDeadId) {
      onMarkBoxPairDead(confirmDeadId)
      setConfirmDeadId(null)
    }
  }

  const cancelMarkDead = () => {
    setConfirmDeadId(null)
  }

  return (
    <div className="box-panel">
      <div className="box-panel-header">
        <h2 className="box-panel-title">Reserve Box</h2>
        <span className="box-panel-count">{boxPairs.length}</span>
      </div>

      {showEditor ? (
        <BoxPairEditor
          lockedNames={lockedNames}
          deadNames={deadNames}
          activeNames={activeNames}
          boxedNames={boxedNames}
          onSave={(p1, p2, route, notes) => {
            onAddBoxPair(p1, p2, route, notes)
            setShowEditor(false)
          }}
          onCancel={() => setShowEditor(false)}
        />
      ) : (
        <button className="box-add-btn" onClick={() => setShowEditor(true)} type="button">
          + Add Reserve Pair
        </button>
      )}

      {boxPairs.length === 0 && !showEditor && (
        <p className="box-empty">No Pokémon in reserve.</p>
      )}

      <div className="box-list">
        {boxPairs.map((pair, i) => (
          <div key={pair.id} className="box-pair-entry">
            {confirmDeadId === pair.id ? (
              <div className="death-confirm">
                <span className="death-confirm-text">Mark this reserve pair as dead? Both linked Pokémon will be moved to the Graveyard.</span>
                <div className="death-confirm-buttons">
                  <button className="death-confirm-yes" onClick={confirmMarkDead}>Yes, they died</button>
                  <button className="death-confirm-no" onClick={cancelMarkDead}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="box-pair-header">
                  <span className="box-pair-label">Reserve Pair {i + 1}</span>
                  <button className="box-pair-remove" onClick={() => onRemoveBoxPair(pair.id)} aria-label="Remove pair">&times;</button>
                </div>
                <div className="box-pair-players">
                  <div className="player-area">
                    <span className="player-label">Player 1</span>
                    {pair.player1.isLoading ? (
                      <div className="search-loading">
                        <div className="spinner-small" />
                        <p>Loading Pokémon data...</p>
                      </div>
                    ) : pair.player1.error ? (
                      <div className="box-pair-error">
                        <span className="box-pair-errmsg">{pair.player1.error}</span>
                      </div>
                    ) : pair.player1.pokemon ? (
                      <CompactPokemonCard
                        pokemon={pair.player1.pokemon}
                        onClear={() => onRemoveBoxPair(pair.id)}
                        onMarkDead={() => handleMarkDead(pair.id)}
                      />
                    ) : (
                      <EmptyPokemonSlot playerLabel="Player 1's" onClick={() => {}} />
                    )}
                  </div>
                  <div className="player-area">
                    <span className="player-label">Player 2</span>
                    {pair.player2.isLoading ? (
                      <div className="search-loading">
                        <div className="spinner-small" />
                        <p>Loading Pokémon data...</p>
                      </div>
                    ) : pair.player2.error ? (
                      <div className="box-pair-error">
                        <span className="box-pair-errmsg">{pair.player2.error}</span>
                      </div>
                    ) : pair.player2.pokemon ? (
                      <CompactPokemonCard
                        pokemon={pair.player2.pokemon}
                        onClear={() => onRemoveBoxPair(pair.id)}
                        onMarkDead={() => handleMarkDead(pair.id)}
                      />
                    ) : (
                      <EmptyPokemonSlot playerLabel="Player 2's" onClick={() => {}} />
                    )}
                  </div>
                </div>
                <div className="box-pair-activate-area">
                  {(() => {
                    const reason = getActivationBlockReason(pair, evoLockedNames, activeNames)
                    const disabled = !hasEmptySlot || reason !== null
                    return (
                      <>
                        <button
                          className="box-pair-activate"
                          disabled={disabled}
                          onClick={() => onActivateReservePair(pair.id)}
                          type="button"
                        >
                          Activate
                        </button>
                        {disabled && (
                          <span className="box-pair-activate-reason">
                            {!hasEmptySlot ? "No empty team slot" : reason}
                          </span>
                        )}
                      </>
                    )
                  })()}
                </div>
                {pair.route && <span className="box-pair-route">{pair.route}</span>}
                {pair.notes && <span className="box-pair-notes">{pair.notes}</span>}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
