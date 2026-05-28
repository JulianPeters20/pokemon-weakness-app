import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import type { SoulLinkTeam, SoulLinkSlotData, SlotEntry, ProgressFilters, EncounterMethod, BoxPairData } from "../types.ts"
import type { GraveyardEntry } from "../components/GraveyardPanel.tsx"
import { DEFAULT_FILTERS } from "../encounterFilter.ts"
import { fetchSlotEntry } from "./useSlotPokemon.ts"
import { saveRunState, loadRunState, clearRunState, type PersistedRunState } from "../utils/storage.ts"
import { getEvolutionLineMemberNames, clearEvolutionCache } from "../utils/evolutionLock.ts"

const _initialSaved = loadRunState()

function fromSaved<T>(fn: (saved: typeof _initialSaved) => T): T {
  return fn(_initialSaved)
}

const SLOT_COUNT = 6

function createEmptySlotEntry(): SlotEntry {
  return { pokemon: null, weaknesses: [], generation: "", isLoading: false, error: "" }
}

function createEmptySlotData(slotNumber: number): SoulLinkSlotData {
  return {
    slotNumber,
    player1: createEmptySlotEntry(),
    player2: createEmptySlotEntry(),
    route: "",
    notes: "",
    fainted: "none",
  }
}

function createEmptyTeam(): SoulLinkTeam {
  return Array.from({ length: SLOT_COUNT }, (_, i) => createEmptySlotData(i + 1)) as SoulLinkTeam
}

export function usePersistentRunState() {
  const [slots, setSlots] = useState<SoulLinkTeam>(() =>
    fromSaved((saved) => {
      if (!saved) return createEmptyTeam()
      return saved.slots.map((slot) => ({
        ...slot,
        player1: { ...slot.player1, isLoading: false, error: "" },
        player2: { ...slot.player2, isLoading: false, error: "" },
      })) as SoulLinkTeam
    }),
  )

  const [graveyard, setGraveyard] = useState<GraveyardEntry[]>(() =>
    fromSaved((saved) => {
      if (!saved) return []
      return saved.graveyardEntries.map((e) => ({ ...e, isLoading: false, error: "" }))
    }),
  )

  const [encounterFilters, setEncounterFilters] = useState<ProgressFilters>(() =>
    fromSaved((saved) => saved?.encounterFilters ?? DEFAULT_FILTERS),
  )

  const [usedLocations, setUsedLocations] = useState<Set<string>>(() =>
    fromSaved((saved) => new Set(saved?.usedLocationKeys ?? [])),
  )

  const [showLocked, setShowLocked] = useState(() =>
    fromSaved((saved) => saved?.showLocked ?? false),
  )

  const [boxPairs, setBoxPairs] = useState<BoxPairData[]>(() =>
    fromSaved((saved) => saved?.boxPairs ?? []),
  )

  const isLoaded = useRef(false)

  useEffect(() => {
    if (!isLoaded.current) {
      isLoaded.current = true
      return
    }
    const state = {
      version: 2,
      slots,
      graveyardEntries: graveyard,
      boxPairs,
      encounterFilters,
      usedLocationKeys: Array.from(usedLocations),
      showLocked,
    }
    saveRunState(state)
  }, [slots, graveyard, boxPairs, encounterFilters, usedLocations, showLocked])

  const activeNames = useMemo(() => {
    const names = new Set<string>()
    for (const slot of slots) {
      if (slot.player1.pokemon) names.add(slot.player1.pokemon.name.toLowerCase())
      if (slot.player2.pokemon) names.add(slot.player2.pokemon.name.toLowerCase())
    }
    return names
  }, [slots])

  const boxedNames = useMemo(() => {
    const names = new Set<string>()
    for (const pair of boxPairs) {
      if (pair.player1.pokemon) names.add(pair.player1.pokemon.name.toLowerCase())
      if (pair.player2.pokemon) names.add(pair.player2.pokemon.name.toLowerCase())
    }
    return names
  }, [boxPairs])

  const deadNames = useMemo(() => {
    const names = new Set<string>()
    for (const entry of graveyard) {
      if (entry.pokemon) {
        names.add(entry.pokemon.name.toLowerCase())
      } else {
        names.add(entry.name.toLowerCase())
      }
    }
    return names
  }, [graveyard])

  const [lockedNames, setLockedNames] = useState<Set<string>>(() => new Set(deadNames))

  useEffect(() => {
    let cancelled = false

    const buildLockedNames = async () => {
      const names = new Set<string>()

      for (const entry of graveyard) {
        if (entry.pokemon) {
          names.add(entry.pokemon.name.toLowerCase())
        } else {
          names.add(entry.name.toLowerCase())
        }
      }

      const processed = new Set<string>()
      const promises: Promise<string[]>[] = []

      for (const entry of graveyard) {
        const speciesUrl = entry.pokemon?.species?.url
        if (speciesUrl && !processed.has(speciesUrl)) {
          processed.add(speciesUrl)
          promises.push(getEvolutionLineMemberNames(speciesUrl))
        }
      }

      if (promises.length > 0) {
        const results = await Promise.all(promises)
        for (const members of results) {
          for (const m of members) {
            names.add(m.toLowerCase())
          }
        }
      }

      if (!cancelled) {
        setLockedNames(names)
      }
    }

    buildLockedNames()

    return () => {
      cancelled = true
    }
  }, [graveyard])

  const unavailableNames = useMemo(() => {
    const names = new Set(lockedNames)
    for (const n of activeNames) names.add(n)
    for (const n of boxedNames) names.add(n)
    return names
  }, [lockedNames, activeNames, boxedNames])

  const updateSlotEntry = useCallback(
    (slotIndex: number, player: "player1" | "player2", updates: Partial<SlotEntry>) => {
      setSlots((prev) => {
        const next = [...prev] as SoulLinkTeam
        next[slotIndex] = { ...next[slotIndex], [player]: { ...next[slotIndex][player], ...updates } }
        return next
      })
    },
    [],
  )

  const getBlockReason = useCallback((name: string): string | null => {
    const normalized = name.toLowerCase().trim()
    if (!unavailableNames.has(normalized)) return null
    if (deadNames.has(normalized)) return "already in the Graveyard"
    if (activeNames.has(normalized)) return "already in an active team slot"
    if (boxedNames.has(normalized)) return "already in the Box"
    return "evolution line is in the Graveyard"
  }, [unavailableNames, deadNames, activeNames, boxedNames])

  const handleSelectPokemon = useCallback(
    async (slotIndex: number, player: "player1" | "player2", name: string) => {
      const reason = getBlockReason(name)
      if (reason) {
        updateSlotEntry(slotIndex, player, {
          isLoading: false,
          error: `"${name}" cannot be selected — ${reason}.`,
        })
        return
      }
      updateSlotEntry(slotIndex, player, { isLoading: true, error: "" })
      const result = await fetchSlotEntry(name)
      updateSlotEntry(slotIndex, player, { ...result, isLoading: false })
    },
    [updateSlotEntry, getBlockReason],
  )

  const handleClearPokemon = useCallback(
    (slotIndex: number, player: "player1" | "player2") => {
      updateSlotEntry(slotIndex, player, createEmptySlotEntry())
    },
    [updateSlotEntry],
  )

  const handleAddGraveyard = useCallback(async (player: "player1" | "player2", name: string) => {
    const normalizedName = name.toLowerCase().trim()
    const id = crypto.randomUUID()

    let skip = false
    setGraveyard((prev) => {
      const alreadyExists = prev.some((e) => e.name.toLowerCase() === normalizedName)
      if (alreadyExists) {
        skip = true
        return prev
      }
      return [
        ...prev,
        { id, name, pokemon: null, player, isLoading: true, error: "", timestamp: Date.now() },
      ]
    })

    if (skip) return

    const result = await fetchSlotEntry(name)
    setGraveyard((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, pokemon: result.pokemon, isLoading: false, error: result.error }
          : e,
      ),
    )

    if (result.pokemon) {
      const speciesUrl = result.pokemon.species?.url
      let evoMembers: string[] = []
      if (speciesUrl) {
        evoMembers = await getEvolutionLineMemberNames(speciesUrl)
      }
      if (evoMembers.length === 0) {
        evoMembers = [result.pokemon.name.toLowerCase()]
      }

      const memberNames = new Set(evoMembers.map((m) => m.toLowerCase()))
      setSlots((prev) => {
        const next = [...prev] as SoulLinkTeam
        let changed = false
        for (let i = 0; i < next.length; i++) {
          for (const p of ["player1", "player2"] as const) {
            const slotName = next[i][p].pokemon?.name.toLowerCase()
            if (slotName && memberNames.has(slotName)) {
              next[i] = { ...next[i], [p]: createEmptySlotEntry() }
              changed = true
            }
          }
        }
        return changed ? next : prev
      })
      setBoxPairs((prev) =>
        prev.filter((pair) => {
          const p1Name = pair.player1.pokemon?.name.toLowerCase()
          const p2Name = pair.player2.pokemon?.name.toLowerCase()
          return !(p1Name && memberNames.has(p1Name)) && !(p2Name && memberNames.has(p2Name))
        }),
      )
    }
  }, [])

  const handleRemoveGraveyard = useCallback((id: string) => {
    setGraveyard((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const handleMarkSlotDead = useCallback(async (slotIndex: number) => {
    const slot = slots[slotIndex]
    if (!slot) return

    const p1Pokemon = slot.player1.pokemon
    const p2Pokemon = slot.player2.pokemon

    if (!p1Pokemon && !p2Pokemon) return

    setSlots((prev) => {
      const next = [...prev] as SoulLinkTeam
      next[slotIndex] = createEmptySlotData(slotIndex + 1)
      return next
    })

    const now = Date.now()
    const memberNames = new Set<string>()

    if (p1Pokemon && !lockedNames.has(p1Pokemon.name.toLowerCase())) {
      const id = crypto.randomUUID()
      setGraveyard((prev) => {
        const dup = prev.some((e) => e.name.toLowerCase() === p1Pokemon!.name.toLowerCase())
        if (dup) return prev
        return [...prev, { id, name: p1Pokemon.name, pokemon: p1Pokemon, player: "player1", isLoading: false, error: "", timestamp: now }]
      })
      const evo = await getEvolutionLineMemberNames(p1Pokemon.species.url)
      for (const m of evo) memberNames.add(m.toLowerCase())
    }

    if (p2Pokemon && !lockedNames.has(p2Pokemon.name.toLowerCase())) {
      const id = crypto.randomUUID()
      setGraveyard((prev) => {
        const dup = prev.some((e) => e.name.toLowerCase() === p2Pokemon!.name.toLowerCase())
        if (dup) return prev
        return [...prev, { id, name: p2Pokemon.name, pokemon: p2Pokemon, player: "player2", isLoading: false, error: "", timestamp: now }]
      })
      const evo = await getEvolutionLineMemberNames(p2Pokemon.species.url)
      for (const m of evo) memberNames.add(m.toLowerCase())
    }

    if (memberNames.size > 0) {
      setBoxPairs((prev) =>
        prev.filter((pair) => {
          const p1Name = pair.player1.pokemon?.name.toLowerCase()
          const p2Name = pair.player2.pokemon?.name.toLowerCase()
          return !(p1Name && memberNames.has(p1Name)) && !(p2Name && memberNames.has(p2Name))
        }),
      )
    }
  }, [slots, lockedNames])

  const handleAddBoxPair = useCallback(async (p1Name: string, p2Name: string, route: string, notes: string) => {
    const id = crypto.randomUUID()
    const loadingEntry: SlotEntry = { pokemon: null, weaknesses: [], generation: "", isLoading: true, error: "" }

    setBoxPairs((prev) => [
      ...prev,
      { id, player1: { ...loadingEntry }, player2: { ...loadingEntry }, route, notes },
    ])

    const [result1, result2] = await Promise.all([
      fetchSlotEntry(p1Name),
      fetchSlotEntry(p2Name),
    ])

    setBoxPairs((prev) =>
      prev.map((pair) =>
        pair.id === id
          ? {
              ...pair,
              player1: { ...pair.player1, ...result1, isLoading: false },
              player2: { ...pair.player2, ...result2, isLoading: false },
            }
          : pair,
      ),
    )
  }, [])

  const handleRemoveBoxPair = useCallback((id: string) => {
    setBoxPairs((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const handleMarkBoxPairDead = useCallback((boxId: string) => {
    const pair = boxPairs.find((b) => b.id === boxId)
    if (!pair) return

    const p1Pokemon = pair.player1.pokemon
    const p2Pokemon = pair.player2.pokemon

    setBoxPairs((prev) => prev.filter((b) => b.id !== boxId))

    const now = Date.now()

    if (p1Pokemon && !lockedNames.has(p1Pokemon.name.toLowerCase())) {
      const id = crypto.randomUUID()
      setGraveyard((prev) => {
        const dup = prev.some((e) => e.name.toLowerCase() === p1Pokemon!.name.toLowerCase())
        if (dup) return prev
        return [...prev, { id, name: p1Pokemon.name, pokemon: p1Pokemon, player: "player1", isLoading: false, error: "", timestamp: now }]
      })
    }

    if (p2Pokemon && !lockedNames.has(p2Pokemon.name.toLowerCase())) {
      const id = crypto.randomUUID()
      setGraveyard((prev) => {
        const dup = prev.some((e) => e.name.toLowerCase() === p2Pokemon!.name.toLowerCase())
        if (dup) return prev
        return [...prev, { id, name: p2Pokemon.name, pokemon: p2Pokemon, player: "player2", isLoading: false, error: "", timestamp: now }]
      })
    }
  }, [boxPairs, lockedNames])

  const handleActivateReservePair = useCallback((boxId: string) => {
    const pair = boxPairs.find((b) => b.id === boxId)
    if (!pair) return
    if (!pair.player1.pokemon || !pair.player2.pokemon) return

    const idx = slots.findIndex((s) => !s.player1.pokemon && !s.player2.pokemon)
    if (idx === -1) return

    const p1Name = pair.player1.pokemon.name.toLowerCase()
    const p2Name = pair.player2.pokemon.name.toLowerCase()

    if (lockedNames.has(p1Name) || lockedNames.has(p2Name)) return
    if (activeNames.has(p1Name) || activeNames.has(p2Name)) return

    setBoxPairs((prev) => prev.filter((b) => b.id !== boxId))
    setSlots((prev) => {
      const next = [...prev] as SoulLinkTeam
      next[idx] = {
        ...next[idx],
        player1: { ...pair.player1 },
        player2: { ...pair.player2 },
        route: pair.route,
        notes: pair.notes,
      }
      return next
    })
  }, [boxPairs, slots, lockedNames, activeNames])

  const handleToggleUsed = useCallback((locationId: string, method: EncounterMethod) => {
    const key = `${locationId}::${method}`
    setUsedLocations((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const handleReset = useCallback(() => {
    clearRunState()
    clearEvolutionCache()
    setSlots(createEmptyTeam())
    setGraveyard([])
    setBoxPairs([])
    setLockedNames(new Set())
    setEncounterFilters(DEFAULT_FILTERS)
    setUsedLocations(new Set())
    setShowLocked(false)
    isLoaded.current = true
  }, [])

  const handleImport = useCallback((imported: PersistedRunState) => {
    const team = imported.slots.map((slot) => ({
      ...slot,
      player1: { ...slot.player1, isLoading: false, error: "" },
      player2: { ...slot.player2, isLoading: false, error: "" },
    })) as SoulLinkTeam
    setSlots(team)
    setGraveyard(imported.graveyardEntries.map((e) => ({ ...e, isLoading: false, error: "" })))
    setBoxPairs((imported.boxPairs ?? []).map((b) => ({
      ...b,
      player1: { ...b.player1, isLoading: false, error: "" },
      player2: { ...b.player2, isLoading: false, error: "" },
    })))
    setEncounterFilters(imported.encounterFilters)
    setUsedLocations(new Set(imported.usedLocationKeys))
    setShowLocked(imported.showLocked)
    isLoaded.current = true
  }, [])

  const handleFiltersChange = useCallback((updates: Partial<ProgressFilters>) => {
    setEncounterFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  const graveyardP1 = graveyard.filter((e) => e.player === "player1")
  const graveyardP2 = graveyard.filter((e) => e.player === "player2")

  return {
    slots,
    boxPairs,
    graveyard,
    graveyardP1,
    graveyardP2,
    encounterFilters,
    usedLocations,
    showLocked,
    setShowLocked,
    handleSelectPokemon,
    handleClearPokemon,
    handleAddGraveyard,
    handleRemoveGraveyard,
    handleToggleUsed,
    handleFiltersChange,
    handleImport,
    handleReset,
    deadNames,
    lockedNames,
    activeNames,
    boxedNames,
    unavailableNames,
    handleMarkSlotDead,
    handleAddBoxPair,
    handleRemoveBoxPair,
    handleMarkBoxPairDead,
    handleActivateReservePair,
    getBlockReason,
  }
}
