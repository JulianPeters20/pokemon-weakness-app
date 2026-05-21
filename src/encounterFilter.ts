import type { ProgressFilters, EncounterLocation, EncounterMethod, EncounterRequirement } from "./types.ts"

export const DEFAULT_FILTERS: ProgressFilters = {
  badgeCount: 0,
  postgame: false,
  rodLevel: "none",
  surf: false,
  rockSmash: false,
  underwater: false,
  adm: false,
  devonScope: false,
  showGrassCave: true,
  showSurf: true,
  showFishing: true,
  showRockSmash: true,
  showGifts: true,
  showStatics: true,
  showMissionRewards: false,
  showRandomEgg: true,
  showLegendaries: false,
  showTrades: true,
  showGameCorner: true,
  showSwarms: true,
  completedMissions: [],
}

export function getRodRank(rod: string): number {
  const ranks: Record<string, number> = { none: 0, old: 1, good: 2, super: 3 }
  return ranks[rod] ?? 0
}

const METHOD_CATEGORY_MAP: Record<EncounterMethod, keyof ProgressFilters> = {
  "grass-cave": "showGrassCave",
  surf: "showSurf",
  "fishing-old": "showFishing",
  "fishing-good": "showFishing",
  "fishing-super": "showFishing",
  "rock-smash": "showRockSmash",
  gift: "showGifts",
  static: "showStatics",
  "mission-reward": "showMissionRewards",
  "random-egg": "showRandomEgg",
  legendary: "showLegendaries",
  trade: "showTrades",
  "game-corner": "showGameCorner",
  swarm: "showSwarms",
}

export function isMethodCategoryVisible(method: EncounterMethod, filters: ProgressFilters): boolean {
  const key = METHOD_CATEGORY_MAP[method]
  return key ? filters[key] === true : true
}

export function isEncounterUnlocked(location: EncounterLocation, filters: ProgressFilters): boolean {
  for (const req of location.requirements) {
    if (!isRequirementMet(req, filters)) return false
  }
  return true
}

function isRequirementMet(req: EncounterRequirement, filters: ProgressFilters): boolean {
  switch (req.type) {
    case "badge":
      return filters.badgeCount >= (req.value as number)
    case "postgame":
      return filters.postgame === true
    case "rod":
      return getRodRank(filters.rodLevel) >= getRodRank(req.value as string)
    case "surf":
      return filters.surf === true
    case "rock-smash":
      return filters.rockSmash === true
    case "underwater":
      return filters.underwater === true
    case "adm":
      return filters.adm === true
    case "devon-scope":
      return filters.devonScope === true
    case "mission":
      return filters.showMissionRewards === true || filters.completedMissions.includes(req.value as string)
    case "weekday":
    case "daily":
    case "time":
      return true
    default:
      return true
  }
}

export function getEncounterLockReasons(location: EncounterLocation, filters: ProgressFilters): string[] {
  const reasons: string[] = []
  for (const req of location.requirements) {
    if (!isRequirementMet(req, filters)) {
      reasons.push(req.label)
    }
  }
  return reasons
}

export interface FilteredEncounter {
  location: EncounterLocation
  visible: boolean
  locked: boolean
  lockReasons: string[]
}

export function filterEncountersByProgress(
  locations: EncounterLocation[],
  filters: ProgressFilters,
  showLocked: boolean = false,
): FilteredEncounter[] {
  return locations.map((loc) => {
    const categoryVisible = loc.methods.some((m) => isMethodCategoryVisible(m, filters))
    const unlocked = isEncounterUnlocked(loc, filters)
    const lockReasons = unlocked ? [] : getEncounterLockReasons(loc, filters)

    if (!categoryVisible) {
      return { location: loc, visible: false, locked: false, lockReasons: [] }
    }

    if (unlocked) {
      return { location: loc, visible: true, locked: false, lockReasons: [] }
    }

    if (showLocked) {
      return { location: loc, visible: true, locked: true, lockReasons }
    }

    return { location: loc, visible: false, locked: false, lockReasons: [] }
  })
}

export function countUsedEncounters(
  filtered: FilteredEncounter[],
  records: Map<string, { used: boolean }>,
): number {
  let count = 0
  for (const f of filtered) {
    if (!f.visible) continue
    const key = `${f.location.id}::${f.location.methods[0]}`
    const record = records.get(key)
    if (record?.used) count++
  }
  return count
}
