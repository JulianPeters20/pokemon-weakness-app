import type { EncounterLocation, EncounterMethod } from "../types.ts"

const METHOD_LABELS: Record<string, string> = {
  "grass-cave": "Grass/Cave",
  surf: "Surf",
  "fishing-old": "Old Rod",
  "fishing-good": "Good Rod",
  "fishing-super": "Super Rod",
  "rock-smash": "Rock Smash",
  gift: "Gift",
  static: "Static",
  "mission-reward": "Mission",
  "random-egg": "Random Egg",
  legendary: "Legendary",
  trade: "Trade",
  "game-corner": "Game Corner",
  swarm: "Swarm",
}

interface EncounterLocationCardProps {
  location: EncounterLocation
  used: boolean
  locked?: boolean
  lockReasons?: string[]
  onToggleUsed: (locationId: string, method: EncounterMethod) => void
}

export function EncounterLocationCard({
  location,
  used,
  locked = false,
  lockReasons = [],
  onToggleUsed,
}: EncounterLocationCardProps) {
  const cardClass = [
    "encounter-card",
    used ? "encounter-card--used" : "",
    locked ? "encounter-card--locked" : "",
  ].filter(Boolean).join(" ")

  return (
    <div className={cardClass}>
      <label className="encounter-check-label">
        <input
          type="checkbox"
          className="encounter-check"
          checked={used}
          onChange={() => onToggleUsed(location.id, location.methods[0])}
          disabled={locked}
        />
      </label>
      {locked && <span className="encounter-lock-badge">🔒 Locked</span>}

      <div className="encounter-card-body">
        <div className="encounter-card-top">
          <span className="encounter-location-name">{location.displayName}</span>
          {location.category && (
            <span className="encounter-category-tag">{location.category}</span>
          )}
          <div className="encounter-methods">
            {location.methods.map((m) => (
              <span key={m} className={`encounter-method-tag method--${m}`}>
                {METHOD_LABELS[m]}
              </span>
            ))}
          </div>
          {location.requirements.length > 0 && (
            <div className="encounter-requirements">
              {location.requirements.map((r, i) => (
                <span key={i} className="requirement-tag">
                  {r.label}
                </span>
              ))}
            </div>
          )}
          {location.vanillaRef && location.vanillaRef.length > 0 && (
            <span className="encounter-vanilla-ref">
              Vanilla ref: {location.vanillaRef.join(", ")}
            </span>
          )}
          {location.sourceSheet && (
            <span className="encounter-source-sheet">{location.sourceSheet}</span>
          )}
          {locked && lockReasons.length > 0 && (
            <div className="encounter-lock-reasons">
              {lockReasons.map((reason, i) => (
                <span key={i} className="lock-reason-tag">{reason}</span>
              ))}
            </div>
          )}
          {location.notes && (
            <span className="encounter-note">{location.notes}</span>
          )}
        </div>
      </div>
    </div>
  )
}
