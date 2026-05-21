import { useState } from "react"
import { PokemonSearch } from "./PokemonSearch.tsx"

interface BoxPairEditorProps {
  lockedNames: Set<string>
  deadNames: Set<string>
  activeNames: Set<string>
  boxedNames: Set<string>
  onSave: (p1Name: string, p2Name: string, route: string, notes: string) => void
  onCancel: () => void
}

type EditorStep = "p1" | "p2" | "details"

export function BoxPairEditor({ lockedNames, deadNames, activeNames, boxedNames, onSave, onCancel }: BoxPairEditorProps) {
  const [step, setStep] = useState<EditorStep>("p1")
  const [p1Name, setP1Name] = useState("")
  const [p2Name, setP2Name] = useState("")
  const [route, setRoute] = useState("")
  const [notes, setNotes] = useState("")

  const handleSelectP1 = (name: string) => {
    setP1Name(name)
    setStep("p2")
  }

  const handleSelectP2 = (name: string) => {
    setP2Name(name)
    setStep("details")
  }

  const handleSave = () => {
    if (p1Name && p2Name) {
      onSave(p1Name, p2Name, route, notes)
    }
  }

  const handleBackP1 = () => {
    setStep("p1")
  }

  const handleBackP2 = () => {
    setStep("p2")
  }

  const p2LockedNames = new Set(lockedNames)
  p2LockedNames.add(p1Name.toLowerCase())

  return (
    <div className="box-pair-editor">
      <div className="box-pair-editor-header">
        <span className="box-pair-editor-title">Add Reserve Pair</span>
        <button className="box-pair-editor-cancel" onClick={onCancel} aria-label="Cancel">&times;</button>
      </div>

      {step === "p1" && (
        <div className="box-pair-editor-step">
          <p className="box-pair-editor-prompt">Select Player 1's Pokémon</p>
          <PokemonSearch
            onSelect={handleSelectP1}
            onCancel={onCancel}
            placeholder="Search Player 1 Pokémon..."
            lockedNames={lockedNames}
            deadNames={deadNames}
            activeNames={activeNames}
            boxedNames={boxedNames}
          />
        </div>
      )}

      {step === "p2" && (
        <div className="box-pair-editor-step">
          <p className="box-pair-editor-prompt">Select Player 2's Pokémon</p>
          <p className="box-pair-editor-selected">Player 1: {p1Name}</p>
          <PokemonSearch
            onSelect={handleSelectP2}
            onCancel={handleBackP1}
            placeholder="Search Player 2 Pokémon..."
            lockedNames={p2LockedNames}
            deadNames={deadNames}
            activeNames={activeNames}
            boxedNames={boxedNames}
          />
        </div>
      )}

      {step === "details" && (
        <div className="box-pair-editor-step">
          <p className="box-pair-editor-selected">Player 1: {p1Name}</p>
          <p className="box-pair-editor-selected">Player 2: {p2Name}</p>

          <label className="box-pair-editor-label">
            Route / Location
            <input
              className="box-pair-editor-input"
              type="text"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="e.g. Route 1"
            />
          </label>

          <label className="box-pair-editor-label">
            Notes
            <input
              className="box-pair-editor-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </label>

          <div className="box-pair-editor-actions">
            <button className="box-pair-editor-save-btn" onClick={handleSave}>Save to Box</button>
            <button className="box-pair-editor-back-btn" onClick={handleBackP2}>Back</button>
          </div>
        </div>
      )}
    </div>
  )
}
