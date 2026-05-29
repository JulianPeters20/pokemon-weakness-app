export interface PokemonType {
  slot: number
  type: {
    name: string
    url: string
  }
}

export interface PokemonStat {
  base_stat: number
  stat: {
    name: string
  }
}

export interface PokemonSpeciesRef {
  name: string
  url: string
}

export interface PokemonSprites {
  other: {
    "official-artwork": {
      front_default: string | null
    }
  }
}

export interface Pokemon {
  id: number
  name: string
  species: PokemonSpeciesRef
  types: PokemonType[]
  stats: PokemonStat[]
  sprites: PokemonSprites
  height: number
  weight: number
  moves?: MoveEntry[]
}

export interface MoveVersionGroupDetail {
  level_learned_at: number
  move_learn_method: { name: string; url: string }
  version_group: { name: string; url: string }
}

export interface MoveEntry {
  move: { name: string; url: string }
  version_group_details: MoveVersionGroupDetail[]
}

export interface TypeDamageRelations {
  double_damage_from: { name: string; url: string }[]
  half_damage_from: { name: string; url: string }[]
  no_damage_from: { name: string; url: string }[]
}

export interface TypeData {
  name: string
  damage_relations: TypeDamageRelations
}

export interface PokemonSpecies {
  genera: {
    genus: string
    language: { name: string }
  }[]
  generation: {
    name: string
    url: string
  }
}

export interface TypeMultiplier {
  type: string
  multiplier: number
}

export interface SlotEntry {
  pokemon: Pokemon | null
  weaknesses: TypeMultiplier[]
  generation: string
  isLoading: boolean
  error: string
}

export interface SoulLinkSlotData {
  slotNumber: number
  player1: SlotEntry
  player2: SlotEntry
  route: string
  notes: string
  fainted: "none" | "player1" | "player2" | "both"
}

export type SoulLinkTeam = [
  SoulLinkSlotData,
  SoulLinkSlotData,
  SoulLinkSlotData,
  SoulLinkSlotData,
  SoulLinkSlotData,
  SoulLinkSlotData,
]

export type EncounterMethod =
  | "grass-cave"
  | "surf"
  | "fishing-old"
  | "fishing-good"
  | "fishing-super"
  | "rock-smash"
  | "gift"
  | "static"
  | "mission-reward"
  | "random-egg"
  | "legendary"
  | "trade"
  | "game-corner"
  | "swarm"

export type EncounterCategory =
  | "Routes and Outdoor Areas"
  | "Towns and Cities"
  | "Caves and Dungeons"
  | "Special Encounters"

export interface EncounterRequirement {
  type: "badge" | "postgame" | "rod" | "surf" | "rock-smash" | "underwater" | "adm" | "devon-scope" | "mission" | "weekday" | "daily" | "time"
  value?: string | number
  label: string
}

export interface EncounterLocation {
  id: string
  displayName: string
  category: EncounterCategory
  mapArea?: string
  methods: EncounterMethod[]
  requirements: EncounterRequirement[]
  vanillaRef?: string[]
  sourceSheet?: string
  notes?: string
}

export interface ProgressFilters {
  badgeCount: number
  postgame: boolean
  rodLevel: "none" | "old" | "good" | "super"
  surf: boolean
  rockSmash: boolean
  underwater: boolean
  adm: boolean
  devonScope: boolean
  showGrassCave: boolean
  showSurf: boolean
  showFishing: boolean
  showRockSmash: boolean
  showGifts: boolean
  showStatics: boolean
  showMissionRewards: boolean
  showRandomEgg: boolean
  showLegendaries: boolean
  showTrades: boolean
  showGameCorner: boolean
  showSwarms: boolean
  completedMissions: string[]
}

export interface RandomizedEncounterRecord {
  locationId: string
  method: EncounterMethod
  pokemonName: string
  notes: string
  used: boolean
}

export interface BoxPairData {
  id: string
  player1: SlotEntry
  player2: SlotEntry
  route: string
  notes: string
  priority: 1 | 2 | 3 | 4
}

export interface DeadPokemon {
  id: string
  pokemon: Pokemon | null
  name: string
  player: "player1" | "player2" | "unknown"
  cause?: string
  slotNumber?: number
  timestamp: number
}
