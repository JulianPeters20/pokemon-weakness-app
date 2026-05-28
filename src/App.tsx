import { useState, useRef } from "react"
import { SoulLinkDashboard } from "./components/SoulLinkDashboard.tsx"
import { EncounterTracker } from "./components/EncounterTracker.tsx"
import { GraveyardPanel } from "./components/GraveyardPanel.tsx"
import { BoxPanel } from "./components/BoxPanel.tsx"
import { CollapsibleBattleHelper } from "./components/CollapsibleBattleHelper.tsx"
import { usePersistentRunState } from "./hooks/usePersistentRunState.ts"
import { exportRunState, validateImportedRunState, readFileAsText } from "./utils/exportImport.ts"

export function App() {
  const {
    slots,
    boxPairs,
    graveyardP1,
    graveyardP2,
    encounterFilters,
    usedLocations,
    showLocked,
    setShowLocked,
    handleSelectPokemon,
    handleClearPokemon,
    handleAddGraveyard,
    handleRemoveGraveyard,
    handleToggleUsed,
    handleFiltersChange,
    handleImport,
    handleReset,
    deadNames,
    lockedNames,
    activeNames,
    boxedNames,
    unavailableNames,
    handleMarkSlotDead,
    handleAddBoxPair,
    handleRemoveBoxPair,
    handleMarkBoxPairDead,
    handleActivateReservePair,
  } = usePersistentRunState()

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState("")
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success")
  const [pendingImport, setPendingImport] = useState<unknown>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showFeedback = (msg: string, type: "success" | "error") => {
    setFeedbackMsg(msg)
    setFeedbackType(type)
    setTimeout(() => setFeedbackMsg(""), 4000)
  }

  const confirmReset = () => {
    handleReset()
    setShowResetConfirm(false)
    showFeedback("Run reset to defaults.", "success")
  }

  const handleExport = () => {
    const state = {
      version: 2,
      slots,
      graveyardEntries: [...graveyardP1, ...graveyardP2],
      boxPairs,
      encounterFilters,
      usedLocationKeys: Array.from(usedLocations),
      showLocked,
    }
    exportRunState(state)
    showFeedback("Run exported successfully.", "success")
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await readFileAsText(file)
      const parsed = JSON.parse(text)
      const validation = validateImportedRunState(parsed)
      if (!validation.valid) {
        showFeedback(validation.error, "error")
        return
      }
      setPendingImport(parsed)
    } catch {
      showFeedback("Invalid file: could not parse JSON.", "error")
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const confirmImport = () => {
    if (!pendingImport) return
    handleImport(pendingImport as Parameters<typeof handleImport>[0])
    setPendingImport(null)
    showFeedback("Run imported successfully.", "success")
  }

  const cancelImport = () => {
    setPendingImport(null)
  }

  return (
    <div className="app-container">
      <div className="dashboard-area">
        <SoulLinkDashboard
          slots={slots}
          onSelectPokemon={handleSelectPokemon}
          onClearPokemon={handleClearPokemon}
          lockedNames={unavailableNames}
          deadNames={deadNames}
          activeNames={activeNames}
          boxedNames={boxedNames}
          onMarkSlotDead={handleMarkSlotDead}
        />
        <GraveyardPanel
          player="player1"
          entries={graveyardP1}
          onAdd={(name) => handleAddGraveyard("player1", name)}
          onRemove={handleRemoveGraveyard}
          lockedNames={unavailableNames}
          deadNames={deadNames}
          activeNames={activeNames}
          boxedNames={boxedNames}
        />
        <GraveyardPanel
          player="player2"
          entries={graveyardP2}
          onAdd={(name) => handleAddGraveyard("player2", name)}
          onRemove={handleRemoveGraveyard}
          lockedNames={unavailableNames}
          deadNames={deadNames}
          activeNames={activeNames}
          boxedNames={boxedNames}
        />
      </div>
      <hr className="section-divider" />
      <BoxPanel
        boxPairs={boxPairs}
        lockedNames={unavailableNames}
        evoLockedNames={lockedNames}
        deadNames={deadNames}
        activeNames={activeNames}
        boxedNames={boxedNames}
        onAddBoxPair={handleAddBoxPair}
        onRemoveBoxPair={handleRemoveBoxPair}
        onMarkBoxPairDead={handleMarkBoxPairDead}
        onActivateReservePair={handleActivateReservePair}
        hasEmptySlot={slots.some((s) => !s.player1.pokemon && !s.player2.pokemon)}
      />
      <hr className="section-divider" />
      <EncounterTracker
        filters={encounterFilters}
        onFiltersChange={handleFiltersChange}
        usedLocations={usedLocations}
        onToggleUsed={handleToggleUsed}
        showLocked={showLocked}
        onToggleShowLocked={() => setShowLocked((s: boolean) => !s)}
      />
      <div className="run-management">
        {pendingImport ? (
          <div className="import-confirm">
            <span className="import-confirm-text">Import will overwrite current run. Continue?</span>
            <button className="import-confirm-yes" onClick={confirmImport}>Yes, Import</button>
            <button className="import-confirm-no" onClick={cancelImport}>Cancel</button>
          </div>
        ) : showResetConfirm ? (
          <div className="reset-confirm">
            <span className="reset-confirm-text">Reset all data?</span>
            <button className="reset-confirm-yes" onClick={confirmReset}>Yes, Reset</button>
            <button className="reset-confirm-no" onClick={() => setShowResetConfirm(false)}>Cancel</button>
          </div>
        ) : (
          <div className="run-actions">
            <p className="run-actions-note">
              Export your run to share it with another player or back it up.
              Importing overwrites the current local run.
            </p>
            <div className="run-buttons">
              <button className="run-action-btn export-btn" onClick={handleExport}>
                Export Run
              </button>
              <button className="run-action-btn import-btn" onClick={() => fileInputRef.current?.click()}>
                Import Run
              </button>
              <button className="run-action-btn reset-btn" onClick={() => setShowResetConfirm(true)}>
                Reset Run
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelected}
              style={{ display: "none" }}
            />
          </div>
        )}
      </div>
      <hr className="section-divider" />
      <CollapsibleBattleHelper />
      {feedbackMsg && (
        <div className={`run-feedback run-feedback--${feedbackType}`}>
          {feedbackMsg}
        </div>
      )}
    </div>
  )
}
