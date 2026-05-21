import type { ProgressFilters, EncounterMethod } from "../types.ts"
import { filterEncountersByProgress } from "../encounterFilter.ts"
import { UNBOUND_ENCOUNTERS } from "../data/unboundEncounters.ts"
import { ProgressFilters as FiltersPanel } from "./ProgressFilters.tsx"
import { EncounterLocationCard } from "./EncounterLocationCard.tsx"

interface EncounterTrackerProps {
  filters: ProgressFilters
  onFiltersChange: (updates: Partial<ProgressFilters>) => void
  usedLocations: Set<string>
  onToggleUsed: (locationId: string, method: EncounterMethod) => void
  showLocked: boolean
  onToggleShowLocked: () => void
}

export function EncounterTracker({
  filters,
  onFiltersChange,
  usedLocations,
  onToggleUsed,
  showLocked,
  onToggleShowLocked,
}: EncounterTrackerProps) {
  const filteredEncounters = filterEncountersByProgress(UNBOUND_ENCOUNTERS, filters, showLocked)
  const visibleEncounters = filteredEncounters.filter((f) => f.visible)
  const usedCount = visibleEncounters.filter((f) => {
    const key = `${f.location.id}::${f.location.methods[0]}`
    return usedLocations.has(key)
  }).length

  return (
    <div className="encounter-tracker">
      <div className="tracker-header">
        <h2 className="tracker-title">Encounter Tracker</h2>
        <p className="tracker-subtitle">
          Track which locations you have used for encounters.
          Because the ROM is randomized, vanilla Pokémon are shown only as reference.
        </p>
        <div className="tracker-controls">
          <span className="tracker-count">{usedCount} / {visibleEncounters.length} used</span>
          <button
            className={`tracker-toggle-btn${showLocked ? " active" : ""}`}
            onClick={onToggleShowLocked}
          >
            {showLocked ? "Hide Locked" : "Show Locked"}
          </button>
        </div>
      </div>

      <FiltersPanel filters={filters} onChange={onFiltersChange} />

      <div className="encounter-list">
        {visibleEncounters.map((fe) => {
          const loc = fe.location
          const key = `${loc.id}::${loc.methods[0]}`
          return (
            <EncounterLocationCard
              key={loc.id}
              location={loc}
              used={usedLocations.has(key)}
              locked={fe.locked}
              lockReasons={fe.lockReasons}
              onToggleUsed={onToggleUsed}
            />
          )
        })}
      </div>

      {visibleEncounters.length === 0 && (
        <p className="tracker-empty">No locations match your current filters.</p>
      )}
    </div>
  )
}
