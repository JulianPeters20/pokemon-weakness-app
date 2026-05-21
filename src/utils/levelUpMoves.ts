import type { Pokemon, MoveVersionGroupDetail } from "../types.ts"

export interface LevelUpMove {
  name: string
  level: number
}

const VERSION_GROUPS_IN_ORDER: string[] = [
  "red-blue",
  "yellow",
  "gold-silver",
  "crystal",
  "ruby-sapphire",
  "emerald",
  "firered-leafgreen",
  "colosseum",
  "xd",
  "diamond-pearl",
  "platinum",
  "heartgold-soulsilver",
  "black-white",
  "black-2-white-2",
  "x-y",
  "omega-ruby-alpha-sapphire",
  "sun-moon",
  "ultra-sun-ultra-moon",
  "lets-go-pikachu-lets-go-eevee",
]

function getBestVersionGroupDetail(
  details: MoveVersionGroupDetail[],
): MoveVersionGroupDetail | null {
  let best: MoveVersionGroupDetail | null = null
  let bestIdx = -1
  for (const detail of details) {
    const idx = VERSION_GROUPS_IN_ORDER.indexOf(detail.version_group.name)
    if (idx >= 0 && idx > bestIdx) {
      best = detail
      bestIdx = idx
    }
  }
  return best
}

export function calculateLevelUpMoves(
  pokemon: Pokemon,
  level: number,
): LevelUpMove[] {
  if (!pokemon.moves || !Array.isArray(pokemon.moves)) return []

  const moveMap = new Map<string, number>()

  for (const entry of pokemon.moves) {
    const detail = getBestVersionGroupDetail(entry.version_group_details)
    if (!detail) continue
    if (detail.move_learn_method.name !== "level-up") continue
    if (detail.level_learned_at < 1 || detail.level_learned_at > level) continue

    const name = entry.move.name
    const existing = moveMap.get(name)
    if (existing === undefined || detail.level_learned_at < existing) {
      moveMap.set(name, detail.level_learned_at)
    }
  }

  return Array.from(moveMap.entries())
    .map(([name, lvl]) => ({ name, level: lvl }))
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
}

export function getCurrentMoveset(allMoves: LevelUpMove[]): LevelUpMove[] {
  return allMoves.slice(-4)
}
