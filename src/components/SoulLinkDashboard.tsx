import { SoulLinkSlot } from "./SoulLinkSlot.tsx"
import type { SoulLinkTeam } from "../types.ts"

interface SoulLinkDashboardProps {
  slots: SoulLinkTeam
  onSelectPokemon: (slotIndex: number, player: "player1" | "player2", name: string) => void
  onClearPokemon: (slotIndex: number, player: "player1" | "player2") => void
  lockedNames: Set<string>
  deadNames: Set<string>
  activeNames: Set<string>
  boxedNames: Set<string>
  onMarkSlotDead: (slotIndex: number) => void
}

export function SoulLinkDashboard({ slots, onSelectPokemon, onClearPokemon, lockedNames, deadNames, activeNames, boxedNames, onMarkSlotDead }: SoulLinkDashboardProps) {

  return (
    <div className="soul-link-dashboard">
      <header className="app-header">
        <h1>Pokémon Unbound Soul Link</h1>
        <p className="app-subtitle">
          A Soul Link Nuzlocke companion for two players. Each linked pair shares
          a fate — if one falls, both are lost.
        </p>
      </header>

      <div className="slots-container">
        {slots.map((slot, i) => (
          <SoulLinkSlot
            key={i}
            data={slot}
            onSelectPokemon={(player, name) => onSelectPokemon(i, player, name)}
            onClearPokemon={(player) => onClearPokemon(i, player)}
            lockedNames={lockedNames}
            deadNames={deadNames}
            activeNames={activeNames}
            boxedNames={boxedNames}
            onMarkSlotDead={onMarkSlotDead}
          />
        ))}
      </div>
    </div>
  )
}
