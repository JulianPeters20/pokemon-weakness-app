interface EmptyPokemonSlotProps {
  playerLabel: string
  onClick: () => void
}

export function EmptyPokemonSlot({ playerLabel, onClick }: EmptyPokemonSlotProps) {
  return (
    <button className="empty-pokemon-slot" onClick={onClick} type="button">
      <div className="empty-pokemon-icon">?</div>
      <p className="empty-pokemon-text">Select {playerLabel} Pokémon</p>
    </button>
  )
}
