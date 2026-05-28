# Agent Context - Soullink

> Compact context. Read before modifying code. Suitable for 90-Runtime context windows.

## Project identity

- **Name:** Pokémon Unbound Soul Link Companion
- **Repo:** `D:\Projects\pokemon-weakness-app` — specification: `AGENTS.md`
- **Status:** All features implemented. `npm run build` passes with zero errors.
- **Stack:** React 19 + TypeScript 6 + Vite 8. Zero UI libs, no backend, no accounts.
- **Data sources:** PokéAPI (runtime), local encounter data (Unbound Location Guide), local learnset data (decompiled ROM).

## What the app does

Single-page companion for two players doing a randomized Pokémon Unbound Soul Link Nuzlocke. Tracks 6 linked pairs, dead Pokémon with evolution-line locking, encounter checklist, and standalone type/move reference. All state persists to localStorage.

## Important files

### Read first
`AGENTS.md` (spec), `src/types.ts` (data model)

### State & data flow
- `src/hooks/usePersistentRunState.ts` — Central hook (476 lines). All mutations, derived Sets, fetch orchestration.
- `src/hooks/useSlotPokemon.ts` — Per-slot fetch lifecycle.
- `src/api.ts` — PokéAPI client.

### Pure logic (no React, testable directly)
- `src/generation.ts` — Gen 1–7 filter + Mega detection
- `src/weakness.ts` — Type effectiveness calculator
- `src/utils/evolutionLock.ts` — Evolution chain resolution
- `src/utils/levelUpMoves.ts` — Level-up move filter
- `src/encounterFilter.ts` — Encounter visibility filter
- `src/utils/exportImport.ts` — JSON export/import with version validation
- `src/utils/storage.ts` — localStorage wrapper

### Key components
- `SoulLinkSlot.tsx` — Single linked pair (P1 + P2)
- `PokemonSearch.tsx` — Reusable search/autocomplete (used 5×)
- `CompactPokemonCard.tsx` — Card for slots/graveyard/box
- `GraveyardPanel.tsx` — Per-player dead Pokémon
- `PokemonLookupSection.tsx` — Standalone Battle Helper
- `ProgressFilters.tsx` — Encounter filter controls
- `style.css` — All styles (~1919 lines, single file)

### Data files
- `src/data/unboundEncounters.ts` — Encounter location data (~558 lines)
- `src/data/generated/unboundLearnsets.ts` — Auto-generated learnset data (22k+ lines, large)
- `scripts/convertLearnsets.cjs` — C → TS conversion script
- `scripts/data/Learnsets.c` — Decompiled ROM source (22k+ lines)

## Main data concepts

| Entity | Key fields | Notes |
|---|---|---|
| `SlotEntry` | `pokemon, isLoading, error, weaknesses, generation` | Wraps one Pokémon in one slot. Must handle 4 states. |
| `SoulLinkSlotData` | `player1, player2, slotNumber, fainted` | One linked pair |
| `SoulLinkTeam` | tuple of 6 × `SoulLinkSlotData` | Fixed length, enforced at type level |
| `GraveyardEntry` | `pokemon, player, timestamp, id` | One dead Pokémon |
| `BoxPairData` | `player1, player2, id, route, notes` | Reserve pair with UUID |
| `ProgressFilters` | `badgeCount, postgame, rodLevel, surf, ...` | Controls encounter visibility |
| `EncounterLocation` | `id, displayName, methods, requirements, vanillaRef?` | Static encounter data |
| Availability Sets | `deadNames, activeNames, boxedNames, unavailableNames` | All `Set<string>` of lowercased names |

**EncounterMethod** union: `grass-cave | surf | fishing-old | fishing-good | fishing-super | rock-smash | gift | static | mission-reward | random-egg | legendary | trade | game-corner | swarm`

## Important constraints

1. **Gen 1–7 only, no Megas** — enforced in `generation.ts`. Every search path must use these filters.
2. **Encounter data is reference only** — ROM is randomized. Never use for Pokémon selection logic.
3. **No new dependencies without justification** — currently React 19 + Vite 8 + TypeScript 6 + type defs only.
4. **Single page, no routing** — all sections stack vertically in `App.tsx`.
5. **All styles in `src/style.css`** — global stylesheet, dark theme via CSS custom properties. No CSS modules, no CSS-in-JS.
6. **Pokémon names must be normalized** — always `.toLowerCase().trim()` before comparison or set lookup.
7. **No default exports** — only named exports throughout.
8. **No backend, no accounts, no API keys** — PokéAPI is free and public. State lives in localStorage.

## Safe modification strategy

1. **Read first** — AGENTS.md + Agent Context + relevant source + `npm run build` to confirm baseline.
2. **Find existing pattern** — follow the exact conventions of similar components/hooks.
3. **Plan before code** — list files, data model changes, risks. Get approval before writing.
4. **Implement in order** — types → pure logic → state hook → component → CSS.
5. **Test after every change** — `npm run build` at minimum, manual browser test for UI changes.
6. **Document** — update Obsidian notes for new features, bug patterns, or ADR-worthy decisions.

## Testing checklist

Run after any change:
- [ ] `npm run build` — zero errors (strict TS catches unused imports/params)
- [ ] Desktop layout (≥1024px) — 3-column grid correct
- [ ] Mobile layout (<640px) — single column, no overflow
- [ ] Gen 8 search ("cinderace") → blocked with generation error
- [ ] Mega search ("charizardmegax") → blocked with Mega error
- [ ] Mark slot dead → both Pokémon in correct graveyard
- [ ] Evolution lock: dead Pikachu → Raichu unselectable
- [ ] Export → clear → import → all state restored
- [ ] Page refresh → localStorage state survives

## Common risks

- **Stale `lockedNames` closure.** `handleMarkSlotDead` reads `lockedNames` from closure, may be outdated. New death handlers must recompute from current graveyard.
- **`handleMarkBoxPairDead` misses slot cleanup.** Unlike `handleAddGraveyard`, it does not scan active slots for evolution-line members. New death paths must include this.
- **Import validation gaps.** `validateImportedRunState` does not check `boxPairs` or `showLocked`. New state fields must be added to validator.
- **Evolution lock is async.** Depends on PokéAPI. If fetch fails, no lock enforced. Always initialize from `deadNames` as fallback.
- **CSS class collisions.** Single global stylesheet — class names must be unique across all components.
- **Feedback message race.** Multiple rapid `showFeedback` calls can overlap. Use ref to track active timeout.

## Related Obsidian notes

- [[Project Overview - Soullink]]
- [[Architecture - Soullink]]
- [[Features - Soullink]]
- [[Bug Pattern Candidates - Soullink]]
- [[Rules Candidates - Soullink]]
