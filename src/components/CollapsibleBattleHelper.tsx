import { useState } from "react"
import { PokemonLookupSection } from "./PokemonLookupSection.tsx"

export function CollapsibleBattleHelper() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className="collapsible-section">
      <button
        className="collapsible-header"
        onClick={() => setIsExpanded((s) => !s)}
        aria-expanded={isExpanded}
        aria-controls="battle-helper-content"
        type="button"
      >
        <span className="collapsible-label">Pokémon Lookup / Battle Helper</span>
        <span className={`collapsible-icon ${isExpanded ? "expanded" : ""}`}>
          {isExpanded ? "−" : "+"}
        </span>
      </button>

      <div
        id="battle-helper-content"
        className={`collapsible-content${isExpanded ? " expanded" : ""}`}
      >
        <div className="collapsible-content-inner">
          <PokemonLookupSection />
        </div>
      </div>
    </section>
  )
}
