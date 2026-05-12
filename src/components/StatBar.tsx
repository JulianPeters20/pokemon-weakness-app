const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
}

const MAX_STAT = 255

interface StatBarProps {
  statName: string
  value: number
}

export function StatBar({ statName, value }: StatBarProps) {
  const label = STAT_LABELS[statName] ?? statName
  const pct = Math.min((value / MAX_STAT) * 100, 100)
  const hue = Math.round((value / MAX_STAT) * 120)
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      <div className="stat-bar-bg">
        <div
          className="stat-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: `hsl(${hue}, 70%, 50%)` }}
        />
      </div>
    </div>
  )
}
