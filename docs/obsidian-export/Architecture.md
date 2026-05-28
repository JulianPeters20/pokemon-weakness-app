# Architecture - Soullink

## Overview

The app is a single-page React application with no routing, no backend, and no external state management. All run state lives in a single custom hook (`usePersistentRunState`) that is persisted to localStorage. The UI is a vertical stack of independent sections (team dashboard, graveyard, box, encounters, lookup), with the dashboard section using a 3-column CSS Grid to show graveyards flanking the active team slots.

Data flows unidirectionally: user input → state hook → (optional PokéAPI fetch) → state update → localStorage save → UI re-render.

## Repository structure

```
/
├── index.html              Entry HTML (mounts #app)
├── package.json            React 19 + Vite 8 + TypeScript 6 deps
├── tsconfig.json           Strict TS config (noUnusedLocals, verbatimModuleSyntax)
├── AGENTS.md               Full project specification
├── README.md               User-facing docs
├── scripts/
│   ├── convertLearnsets.cjs    C struct → TS learnset converter
│   └── data/Learnsets.c        Decompiled ROM source (22k lines)
├── src/
│   ├── main.tsx                React entry point
│   ├── App.tsx                 Root component, arranges all sections
│   ├── types.ts                All TypeScript interfaces/types
│   ├── style.css               Global stylesheet (~1919 lines)
│   ├── api.ts                  PokéAPI fetch client
│   ├── generation.ts           Gen 1-7 + Mega filtering
│   ├── weakness.ts             Type effectiveness calculator
│   ├── encounterFilter.ts      Progress-based encounter filtering
│   ├── assets/                 Static images (favicon, etc.)
│   ├── hooks/
│   │   ├── usePersistentRunState.ts  Central state hook (476 lines)
│   │   └── useSlotPokemon.ts         Per-slot fetch lifecycle
│   ├── utils/
│   │   ├── evolutionLock.ts     Evolution chain resolution + locking
│   │   ├── levelUpMoves.ts      Level-up move filtering
│   │   ├── unboundLearnsets.ts  Wrapper for generated learnset data
│   │   ├── exportImport.ts      JSON export/import with validation
│   │   └── storage.ts           localStorage read/write
│   ├── data/
│   │   ├── unboundEncounters.ts      Encounter location table
│   │   └── generated/
│   │       └── unboundLearnsets.ts   Auto-generated learnset mapping
│   └── components/
│       ├── SoulLinkDashboard.tsx
│       ├── SoulLinkSlot.tsx
│       ├── PokemonSearch.tsx
│       ├── PokemonCard.tsx
│       ├── CompactPokemonCard.tsx
│       ├── TypeBadge.tsx
│       ├── StatBar.tsx
│       ├── EmptyPokemonSlot.tsx
│       ├── SearchBar.tsx
│       ├── GraveyardPanel.tsx
│       ├── BoxPanel.tsx
│       ├── BoxPairEditor.tsx
│       ├── EncounterTracker.tsx
│       ├── EncounterLocationCard.tsx
│       ├── ProgressFilters.tsx
│       └── PokemonLookupSection.tsx
└── docs/obsidian-export/     These documentation files
```

## Frontend architecture

### Pages

Single page. No routing. All sections are stacked vertically in `App.tsx`. Layout order:

1. Dashboard area (3-column grid: P1 Graveyard → 6 slots → P2 Graveyard)
2. Reserve Box section
3. Encounter Tracker section
4. Run management (export/import/reset)
5. Battle Helper / Pokémon Lookup section

### Components

Components fall into three categories:

1. **Layout/wiring** — `App.tsx` (root), `SoulLinkDashboard.tsx`, `SoulLinkSlot.tsx`
2. **Feature panels** — `GraveyardPanel.tsx`, `BoxPanel.tsx`, `EncounterTracker.tsx`, `PokemonLookupSection.tsx`
3. **Reusable UI** — `PokemonSearch.tsx`, `CompactPokemonCard.tsx`, `PokemonCard.tsx`, `TypeBadge.tsx`, `StatBar.tsx`, `EmptyPokemonSlot.tsx`, `SearchBar.tsx`, `ProgressFilters.tsx`, `EncounterLocationCard.tsx`, `BoxPairEditor.tsx`

The `PokemonSearch` component is the most reused — it appears in 5 places (each slot × 2 players, each Graveyard × 2, Box pair editor).

### State management

No external library. A single custom hook `usePersistentRunState` (`src/hooks/usePersistentRunState.ts`, 476 lines) manages all mutable state:

- `slots` (6 Soul Link pairs)
- `graveyardP1`, `graveyardP2` (dead Pokémon arrays)
- `boxPairs` (reserve pair array)
- `encounterFilters` (progress filter object)
- `usedLocations` (Set of location+method keys)
- `showLocked` (toggle for locked encounter visibility)

Derived sets are computed from these:
- `deadNames`: all Pokémon in either graveyard
- `activeNames`: all Pokémon currently on the team
- `boxedNames`: all Pokémon in the box
- `unavailableNames`: all Pokémon whose evolution line has a member in graveyards

These `Set<string>` values are passed to child components to block selection of locked Pokémon.

### Routing

No routing. Single-page, all sections visible via scroll.

### Styling

Single global CSS file (`src/style.css`). Dark theme via CSS custom properties on `:root`. CSS Grid for the 3-column dashboard layout. Responsive breakpoints at 1024px (graveyards move above/below) and 640px (everything stacks). No CSS modules, no CSS-in-JS.

## Data model

All types are defined in `src/types.ts`.

### Pokémon (`Pokemon`)

The core fetched object from PokéAPI. Contains `id`, `name`, `species` (reference), `types` (array of slot+type), `stats` (array of base_stat+stat_name), `sprites` (official artwork URL), `height`, `weight`, and optional `moves`.

### SlotEntry

The wrapper around a fetched Pokémon in a Soul Link context. Each entry carries:
- `pokemon: Pokemon | null` — the fetched data (null when empty or loading)
- `weaknesses: TypeMultiplier[]` — pre-computed weakness list
- `generation: string` — generation label (e.g. "Generation V")
- `isLoading: boolean` — true during fetch
- `error: string` — error message if fetch failed

Every slot, graveyard entry, and box pair slot uses this same structure.

### SoulLinkSlotData

One linked pair. Contains:
- `slotNumber: number` (1–6)
- `player1: SlotEntry`
- `player2: SlotEntry`
- `route: string` (optional encounter location)
- `notes: string` (optional user notes)
- `fainted: "none" | "player1" | "player2" | "both"`

### SoulLinkTeam

A fixed-length tuple of exactly 6 `SoulLinkSlotData` elements. Ensures at the type level that there are always 6 slots.

### EncounterLocation

Static encounter data from the Unbound Location Guide. Contains `id`, `displayName`, `category`, `methods` (array of `EncounterMethod`), `requirements` (array of `EncounterRequirement`), optional `vanillaRef` Pokémon names, and notes.

### EncounterMethod

Union type: `"grass-cave" | "surf" | "fishing-old" | "fishing-good" | "fishing-super" | "rock-smash" | "gift" | "static" | "mission-reward" | "random-egg" | "legendary" | "trade" | "game-corner" | "swarm"`.

### ProgressFilters

Object controlling which encounters are visible. Contains `badgeCount` (0–8), `postgame` boolean, `rodLevel` ("none"/"old"/"good"/"super"), toggles for surf/rockSmash/underwater/adm/devonScope, toggles for each encounter category, and a `completedMissions` string array.

### BoxPairData

Similar to a Soul Link pair but with `id` (UUID string), two `SlotEntry` fields, `route`, and `notes`. Used in the reserve box.

### DeadPokemon

Represents a single dead Pokémon in a graveyard. Contains `id` (UUID), `name` (search string), `pokemon: Pokemon | null` (fetched data), `player` ("player1"/"player2"/"unknown"), optional `cause`, optional `slotNumber`, and `timestamp`.

### EncounterRequirement

Typed requirements for unlocking encounters: `badge`, `postgame`, `rod`, `surf`, `rock-smash`, `underwater`, `adm`, `devon-scope`, `mission`, `weekday`, `daily`, `time`.

### Players

Players are not a first-class data type. They exist implicitly as two graveyard arrays (`graveyardP1`, `graveyardP2`) and two player fields per Soul Link slot (`player1`, `player2`). There is no player object, profile, or settings.

## Persistence

Data is persisted to `localStorage` under the key `soul-link-run-state`.

The persist cycle:
1. Every state mutation in `usePersistentRunState` calls `saveToStorage(state)` from `src/utils/storage.ts`
2. On app mount, `loadFromStorage()` reads the key and hydrates state (with fallback to defaults)
3. Export creates a versioned JSON file from the current state (version 2)
4. Import validates the JSON shape/version before overwriting

The hook uses `useEffect` with a JSON-stringified dependency to trigger saves only when state actually changes.

### What is persisted

- All 6 Soul Link slots (with full Pokémon data including cached API responses)
- Both graveyards
- All box pairs
- Encounter filter settings
- Used location keys
- Show-locked toggle

### What is NOT persisted

- Evolution chain cache (module-level `Map`, lost on refresh)
- All-pokémon name list (module-level `Map` in `api.ts`, lost on refresh)
- Feedback messages
- Confirm dialog states

## Data flow

### Pokémon selection flow

1. User clicks an empty slot → `SoulLinkSlot` sets `searchingFor` to the player
2. `PokemonSearch` renders with a text input
3. User types ≥2 characters → suggestions filtered from cached all-pokémon list
4. User selects a suggestion → `onSelectPokemon(slotIndex, player, name)` in `usePersistentRunState`
5. The hook calls `fetchAndSetPokemon(slotIndex, player, name)` which delegates to `useSlotPokemon`
6. `useSlotPokemon` calls `fetchPokemon(name)` → PokéAPI → returns `Pokemon` object
7. On success, hook fetches species data and type data in parallel
8. Hook computes `weaknesses` via `weakness.ts` and `generation` string
9. State is updated with the populated `SlotEntry`, derived sets recomputed
10. `useEffect` detects state change, calls `localStorage.setItem`
11. UI re-renders: slot shows `CompactPokemonCard` instead of search

### Dead marking flow

1. User clicks skull button on a slot
2. Death confirmation dialog appears
3. User confirms → `handleMarkSlotDead(slotIndex)` fires
4. Both player Pokémon are pushed to their respective graveyard arrays
5. Slot entries are cleared
6. Derived sets recompute (deadNames, activeNames, unavailableNames update)
7. localStorage saves

### Encounter toggle flow

1. User clicks a location card checkbox
2. `handleToggleUsed(locationId, method)` fires
3. Key `"locationId::method"` is added/removed from `usedLocations` Set
4. Encounter UI re-renders with updated count

## Important files

| File | Role |
|---|---|
| `src/App.tsx` | Root component — wires hook to UI, arranges all sections vertically |
| `src/hooks/usePersistentRunState.ts` | Central state — all mutations, derived sets, slot fetch orchestration |
| `src/hooks/useSlotPokemon.ts` | Slot-level fetch lifecycle (loading, error, success states) |
| `src/api.ts` | PokéAPI network layer — `fetchPokemon`, `fetchPokemonSpecies`, `fetchTypeData`, `fetchAllPokemonNames` |
| `src/generation.ts` | Filter rules — `isSupportedGeneration`, `isMega`, `getGenerationFromId` |
| `src/weakness.ts` | Type math — `combineDamageRelations`, `calculateWeaknesses` |
| `src/encounterFilter.ts` | Location visibility — `filterEncountersByProgress` |
| `src/utils/evolutionLock.ts` | Chain resolution — `buildEvolutionLine`, `buildAllEvolutionLines` |
| `src/utils/storage.ts` | localStorage wrapper — `saveToStorage`, `loadFromStorage` |
| `src/utils/exportImport.ts` | JSON export/import — version 2 format, validation |
| `src/types.ts` | All data type definitions |
| `src/style.css` | Global stylesheet |

## Architectural strengths

1. **No unnecessary abstractions** — the app uses plain React hooks and props, no store, no context, no reducers. The complexity matches the scope.

2. **Derived sets pattern** — `deadNames`, `activeNames`, `boxedNames`, `unavailableNames` are computed from source state and passed as props. This keeps availability checks consistent and avoids scattered logic.

3. **Component reusability** — `PokemonSearch` works in 5 places. `CompactPokemonCard` renders in slots, graveyards, and box. `TypeBadge` and `StatBar` are pure presentational components.

4. **Clear async lifecycle** — every `SlotEntry` carries its own `isLoading`, `error`, and `pokemon` fields. No global loading state means each slot/entry can independently show loading/error/content.

5. **Single CSS file** — for this project size, avoiding CSS modules or CSS-in-JS reduces build complexity. The dark theme via custom properties is clean and maintainable.

6. **Separated concerns by file** — generation filtering, weakness calculation, evolution locking, and encounter filtering are each in dedicated modules with no cross-imports between them.

## Architectural weaknesses

1. **Monolithic state hook** — `usePersistentRunState.ts` at 476 lines handles state, side effects, derived data, and callback creation. Extracting sub-hooks (e.g., `useGraveyardState`, `useEncounterState`) would improve maintainability as the app grows.

2. **No context API** — derived sets and callbacks are passed through multiple prop layers. `SoulLinkSlot` receives `lockedNames`, `deadNames`, `activeNames`, `boxedNames` just to forward them to `PokemonSearch`. A context for availability data would reduce prop drilling.

3. **Global CSS risks** — all styles share one namespace. Class name collisions are possible. Component-specific styles (e.g., `.search-input` used in multiple contexts) could conflict.

4. **Module-level caches are session-only** — `api.ts` caches the all-pokémon list in a module variable, and `evolutionLock.ts` caches evolution chains similarly. Both are lost on page refresh, causing re-fetches. This is acceptable for now but not ideal for a PWA.

5. **No error recovery in persistence** — `saveToStorage` does not handle `QuotaExceededError` or localStorage unavailability. If storage fails, the user gets no warning and loses progress on next refresh.

6. **Import validation is strict** — the validator rejects any missing field or unknown version with no migration path. Old export files cannot be imported after a state shape change.

## Related notes

- [[Project Overview - Soullink]]
- [[Features - Soullink]]
- [[ADR Candidates - Soullink]]
- [[Rules Candidates - Soullink]]
