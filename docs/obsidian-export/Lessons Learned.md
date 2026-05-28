# Lessons Learned

## Architecture & Design

### 1. Single State Hook Scaling
The entire app state lives in one 476-line hook (`src/hooks/usePersistentRunState.ts`). This worked well for the current complexity but would become unwieldy with more features. A future refactoring could extract sub-hooks (e.g., `useGraveyard`, `useEncounterState`).

**See:** [[ADR Candidates#ADR-001 Single State Hook vs Separate Stores]]

### 2. CSS Grid for Dashboard Layout
The 3-column layout (graveyard | 6 slots | graveyard) using CSS Grid (`grid-template-areas`) was effective and responsive. The breakpoint at 1024px collapses graveyards above/below the slots, and at 640px everything stacks vertically.

**Code ref:** `src/style.css` lines 976–1000 (`.dashboard-area` grid definitions).

### 3. PokemonSearch as a Reusable Component
The `PokemonSearch` component (`src/components/PokemonSearch.tsx`) is reused in 5 places: each Soul Link slot, each Graveyard panel, and the Box pair editor. Its design with `lockedNames`, `deadNames`, `activeNames`, `boxedNames` sets keeps availability logic centralized.

**Key insight:** Passing `Set<string>` for blocked names was cleaner than passing individual booleans or callbacks for each block reason.

### 4. Evolution Lock Cache Strategy
`src/utils/evolutionLock.ts` caches evolution chain results in a module-level `Map<string, Set<string>>`. This avoids repeated API calls for the same species but means the cache is lost on page refresh. For a localStorage-persisted app, persisting the cache too would be a nice improvement.

### 5. Learnset Data from Decompiled ROM
The learnset conversion pipeline (`scripts/convertLearnsets.cjs` → `src/data/generated/unboundLearnsets.ts`) was the most technically interesting part. The source data (`scripts/data/Learnsets.c`) is from a decompiled Pokémon Unbound ROM. The script converts C structs to TypeScript mappings.

**Challenges encountered:**
- C struct parsing without a proper AST
- Matching Pokémon names between the ROM data and PokéAPI
- Handling move name normalization (hyphens, spaces, casing)
- The generated file is very large — may cause editor lag

**See:** [[ADR Candidates#ADR-004 Learnset Conversion from C Source]]

### 6. Type System Evolution
The types (`src/types.ts`, 193 lines) went through several iterations as features were added:
- Initial: `Pokemon`, `TypeData` — basic lookup
- Added: `SlotEntry`, `SoulLinkSlotData`, `SoulLinkTeam` — Soul Link structure
- Added: `EncounterLocation`, `ProgressFilters`, `EncounterRequirement` — encounter tracking
- Added: `BoxPairData`, `DeadPokemon` — reserve & graveyard
- Added: `RandomizedEncounterRecord` — randomizer awareness

The `SoulLinkTeam` type is a fixed-length tuple of exactly 6 slots, which ensures the invariant at the type level.

### 7. Async Data Lifecycle
Managing Pokemon fetch state (loading/error/success) for each slot independently required careful design. Each `SlotEntry` has its own `isLoading`, `error`, `pokemon` fields. The `useSlotPokemon` hook (`src/hooks/useSlotPokemon.ts`) handles the fetch lifecycle.

**Lesson:** Don't share a single loading state across all slots — that would make the UI flicker and feel unresponsive.

## Related Notes

- [[Architecture]]
- [[Features]]
- [[Bug Pattern Candidates]]
- [[Rules Candidates]]
