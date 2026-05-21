import type { ProgressFilters } from "../types.ts"

interface ProgressFiltersProps {
  filters: ProgressFilters
  onChange: (updates: Partial<ProgressFilters>) => void
}

export function ProgressFilters({ filters, onChange }: ProgressFiltersProps) {
  const toggle = (key: keyof ProgressFilters) => {
    onChange({ [key]: !filters[key] } as Partial<ProgressFilters>)
  }

  return (
    <div className="filters-panel">
      <div className="filters-row">
        <label className="filter-group">
          <span className="filter-label">Badges</span>
          <div className="badge-stepper">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => onChange({ badgeCount: Math.max(0, filters.badgeCount - 1) })}
              disabled={filters.badgeCount <= 0}
            >
              &minus;
            </button>
            <span className="badge-count">{filters.badgeCount}</span>
            <button
              type="button"
              className="stepper-btn"
              onClick={() => onChange({ badgeCount: Math.min(16, filters.badgeCount + 1) })}
              disabled={filters.badgeCount >= 16}
            >
              +
            </button>
          </div>
        </label>

        <label className="filter-group">
          <span className="filter-label">Rod</span>
          <select
            className="filter-select"
            value={filters.rodLevel}
            onChange={(e) => onChange({ rodLevel: e.target.value as ProgressFilters["rodLevel"] })}
          >
            <option value="none">None</option>
            <option value="old">Old</option>
            <option value="good">Good</option>
            <option value="super">Super</option>
          </select>
        </label>

        <label className="filter-check">
          <input type="checkbox" checked={filters.surf} onChange={() => toggle("surf")} />
          <span>Surf</span>
        </label>

        <label className="filter-check">
          <input type="checkbox" checked={filters.rockSmash} onChange={() => toggle("rockSmash")} />
          <span>Rock Smash</span>
        </label>

        <label className="filter-check">
          <input type="checkbox" checked={filters.underwater} onChange={() => toggle("underwater")} />
          <span>Underwater</span>
        </label>

        <label className="filter-check">
          <input type="checkbox" checked={filters.adm} onChange={() => toggle("adm")} />
          <span>ADM</span>
        </label>

        <label className="filter-check">
          <input type="checkbox" checked={filters.devonScope} onChange={() => toggle("devonScope")} />
          <span>Devon Scope</span>
        </label>

        <label className="filter-check">
          <input type="checkbox" checked={filters.postgame} onChange={() => toggle("postgame")} />
          <span>Postgame</span>
        </label>
      </div>

      <details className="filters-categories-details">
        <summary className="filters-categories-summary">Encounter Categories</summary>
        <div className="filters-categories">
          <label className="filter-check">
            <input type="checkbox" checked={filters.showGrassCave} onChange={() => toggle("showGrassCave")} />
            <span>Grass / Cave</span>
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={filters.showSurf} onChange={() => toggle("showSurf")} />
            <span>Surf</span>
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={filters.showFishing} onChange={() => toggle("showFishing")} />
            <span>Fishing</span>
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={filters.showRockSmash} onChange={() => toggle("showRockSmash")} />
            <span>Rock Smash</span>
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={filters.showGifts} onChange={() => toggle("showGifts")} />
            <span>Gifts</span>
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={filters.showStatics} onChange={() => toggle("showStatics")} />
            <span>Statics</span>
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={filters.showMissionRewards} onChange={() => toggle("showMissionRewards")} />
            <span>Mission Rewards</span>
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={filters.showRandomEgg} onChange={() => toggle("showRandomEgg")} />
            <span>Random Eggs</span>
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={filters.showLegendaries} onChange={() => toggle("showLegendaries")} />
            <span>Legendaries</span>
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={filters.showTrades} onChange={() => toggle("showTrades")} />
            <span>Trades</span>
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={filters.showGameCorner} onChange={() => toggle("showGameCorner")} />
            <span>Game Corner</span>
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={filters.showSwarms} onChange={() => toggle("showSwarms")} />
            <span>Swarms</span>
          </label>
        </div>
      </details>
    </div>
  )
}
