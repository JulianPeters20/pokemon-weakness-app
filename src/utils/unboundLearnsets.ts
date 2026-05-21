import { UNBOUND_LEARNSETS } from "../data/generated/unboundLearnsets.ts"
import type { LevelUpMove } from "./levelUpMoves.ts"

export function getUnboundLearnset(pokemonName: string): LevelUpMove[] | null {
  const key = pokemonName.toLowerCase().trim()
  const data = UNBOUND_LEARNSETS[key]
  if (!data || data.length === 0) return null
  return data.map((m) => ({ name: m.move, level: m.level }))
}

export function calculateUnboundLevelUpMoves(
  pokemonName: string,
  level: number,
): LevelUpMove[] {
  const learnset = getUnboundLearnset(pokemonName)
  if (!learnset) return []
  return learnset.filter((m) => m.level <= level)
}
