import type { SoulLinkTeam, ProgressFilters, BoxPairData } from "../types.ts"
import type { GraveyardEntry } from "../components/GraveyardPanel.tsx"

export const STORAGE_KEY = "pokemon-unbound-soullink-state"
const CURRENT_VERSION = 3

export interface PersistedRunState {
  version: number
  slots: SoulLinkTeam
  graveyardEntries: GraveyardEntry[]
  boxPairs: BoxPairData[]
  encounterFilters: ProgressFilters
  usedLocationKeys: string[]
  showLocked: boolean
}

export function saveRunState(state: PersistedRunState): void {
  try {
    const serialized = JSON.stringify({ ...state, version: CURRENT_VERSION })
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch {
    console.warn("Failed to save run state to localStorage")
  }
}

export function loadRunState(): PersistedRunState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedRunState
    const SUPPORTED = [CURRENT_VERSION - 1, CURRENT_VERSION]
    if (!SUPPORTED.includes(parsed.version)) return null
    return parsed
  } catch {
    return null
  }
}

export function clearRunState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    console.warn("Failed to clear run state from localStorage")
  }
}
