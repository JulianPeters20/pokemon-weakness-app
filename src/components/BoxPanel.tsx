import { useState, useMemo } from "react"
import type { BoxPairData } from "../types.ts"
import { MiniPokemonRow } from "./MiniPokemonRow.tsx"
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
  onUpdateBoxPairPriority: (id: string, priority: 1 | 2 | 3 | 4) => void
  hasEmptySlot: boolean
}

const PRIORITY_COLORS: Record<number, string> = {
  1: "#22c55e",
  2: "#84cc16",
  3: "#f97316",
  4: "#ef4444",
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

export function BoxPanel({ boxPairs, lockedNames, evoLockedNames, deadNames, activeNames, boxedNames, onAddBoxPair, onRemoveBoxPair, onMarkBoxPairDead, onActivateReservePair, onUpdateBoxPairPriority, hasEmptySlot }: BoxPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [confirmDeadId, setConfirmDeadId] = useState<string | null>(null)

  const sortedPairs = useMemo(() => {
    return [...boxPairs]
      .map((pair, originalIndex) => ({ pair, originalIndex }))
      .sort((a, b) => {
        const pa = a.pair.priority ?? 2
        const pb = b.pair.priority ?? 2
        if (pa !== pb) return pa - pb
        return b.originalIndex - a.originalIndex
      })
      .map(({ pair }) => pair)
  }, [boxPairs])

  const cyclePriority = (current: 1 | 2 | 3 | 4): 1 | 2 | 3 | 4 => {
    const order: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4]
    const idx = order.indexOf(current)
    return order[(idx + 1) % 4]
  }

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
      <button
        className="box-panel-toggle"
        onClick={() => setIsExpanded((s) => !s)}
        aria-expanded={isExpanded}
        type="button"
      >
        <span className="box-panel-header-content">
          <h2 className="box-panel-title">Reserve Box</h2>
          <span className="box-panel-count">{boxPairs.length}</span>
        </span>
        <span className={`collapsible-icon${isExpanded ? " expanded" : ""}`}>
          {isExpanded ? "−" : "+"}
        </span>
      </button>

      <div className={`collapsible-content${isExpanded ? " expanded" : ""}`}>
        <div className="collapsible-content-inner">
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
            {sortedPairs.map((pair, i) => (
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
                  <div className="box-pair-row">
                    <button
                      className="box-pair-priority"
                      style={{ background: PRIORITY_COLORS[pair.priority ?? 2] }}
                      onClick={() => onUpdateBoxPairPriority(pair.id, cyclePriority(pair.priority ?? 2))}
                      title={`Priority ${pair.priority ?? 2}`}
                      type="button"
                    >
                      {pair.priority ?? 2}
                    </button>
                    <span className="box-pair-index">#{i + 1}</span>

                    {pair.player1.isLoading ? (
                      <div className="search-loading">
                        <div className="spinner-small" />
                      </div>
                    ) : pair.player1.error ? (
                      <span className="mini-row-error">{pair.player1.error}</span>
                    ) : pair.player1.pokemon ? (
                      <MiniPokemonRow pokemon={pair.player1.pokemon} playerLabel="P1" />
                    ) : null}

                    {pair.player2.isLoading ? (
                      <div className="search-loading">
                        <div className="spinner-small" />
                      </div>
                    ) : pair.player2.error ? (
                      <span className="mini-row-error">{pair.player2.error}</span>
                    ) : pair.player2.pokemon ? (
                      <MiniPokemonRow pokemon={pair.player2.pokemon} playerLabel="P2" />
                    ) : null}

                    <div className="box-pair-actions">
                      {(() => {
                        const reason = getActivationBlockReason(pair, evoLockedNames, activeNames)
                        const disabled = !hasEmptySlot || reason !== null
                        return (
                          <button
                            className="box-pair-activate"
                            disabled={disabled}
                            onClick={() => onActivateReservePair(pair.id)}
                            title={disabled ? (!hasEmptySlot ? "No empty team slot" : reason ?? "") : "Activate pair"}
                            type="button"
                          >
                            Activate
                          </button>
                        )
                      })()}
                      <button className="box-pair-skull" onClick={() => handleMarkDead(pair.id)} aria-label="Mark pair as dead" title="Mark as dead">
                        💀
                      </button>
                      <button className="box-pair-remove" onClick={() => onRemoveBoxPair(pair.id)} aria-label="Remove pair" title="Remove">
                        &times;
                      </button>
                    </div>
                  </div>
                )}
                {pair.route && <span className="box-pair-route">{pair.route}</span>}
                {pair.notes && <span className="box-pair-notes">{pair.notes}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
