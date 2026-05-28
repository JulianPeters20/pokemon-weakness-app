---
type: coding-session
project: Soullink
tool: OpenCode
model: Big Pickle
status: completed
date: 2026-05-12 to 2026-05-21
---

# Session - Soullink Final Build with OpenCode

## Goal

Build a polished Soul Link Nuzlocke companion website for two players playing the fanmade game Pokémon Unbound. The app needed to help two players manage their linked Pokémon team during a randomized Soul Link Nuzlocke run.

## Starting point

The repository started as a vanilla Vite + TypeScript scaffold with a basic single-Pokémon lookup page (`06d7a5c`, "Build Pokemon lookup app"). Before OpenCode began working, the existing state included:

- A `PokemonCard` component displaying stats, types, and weaknesses from PokéAPI
- A `SearchBar` with basic autocomplete suggestions
- A `TypeBadge` and `StatBar` component
- Generation 1–7 filtering and Mega exclusion logic in `generation.ts`
- Type effectiveness calculation in `weakness.ts`
- A generic Vite scaffold stylesheet

What was **missing** before the Soul Link session:
- No Soul Link dashboard or slot system
- No Graveyard, Box, or encounter tracking
- No Pokémon search component for reusable slot selection
- No evolution-line lock
- No persistence (localStorage)
- No export/import
- No Pokémon Unbound encounter data or learnset data
- No responsive 3-column layout

## What was built

**Complete Pokémon Unbound Soul Link Companion app** — a single-page React app with:

- **Soul Link Dashboard** — 6 linked pair slots, each with Player 1 and Player 2 Pokémon selectors
- **Graveyard** — separate dead-Pokémon panels per player, with evolution-line locking
- **Reserve Box** — store extra linked pairs with route/notes metadata
- **Encounter Tracker** — location checklist from the Pokémon Unbound Location Guide, filterable by in-game progress (badges, rods, surf, postgame, etc.)
- **Battle Helper / Lookup** — standalone Pokémon search with stats, weaknesses, and level-up moveset calculator
- **Export/Import/Reset** — JSON export for backup/sharing, import with validation, full run reset
- **localStorage Persistence** — automatic save on every state change
- **Evolution-Line Lock** — dead Pokémon lock their entire evolution line globally
- **Pokémon Unbound Learnset Support** — auto-generated level-up move data from decompiled ROM
- **Responsive Dark-Themed UI** — CSS Grid layout, mobile-friendly breakpoints

## Important implementation steps

Reconstructed from git history and code analysis:

1. **Initial scaffold** (commit `7f421d0`) — Vite + TypeScript + React project setup with AGENTS.md specification.

2. **Basic Pokémon lookup** (commit `06d7a5c`) — Implemented `PokemonCard`, `SearchBar`, `StatBar`, `TypeBadge` components. Set up PokéAPI client in `api.ts` with `fetchPokemon()`, `fetchPokemonSpecies()`, `fetchTypeData()`. Built type effectiveness calculation in `weakness.ts`.

3. **Autocomplete and error handling** (commit `b1f640e`) — Added `<PokemonSearch />` with autocomplete dropdown, generation filtering (`generation.ts`), Mega exclusion, and error states for invalid/unsupported Pokémon.

4. **Regional form support** (commit `567f3af`) — Fixed handling for regional variants (Alolan, Galarian forms) by properly extracting species data from the species URL rather than using the Pokémon name directly.

5. **AGENTS.md overhaul** (commit `1cefcb6`) — Updated the project specification to define the full Soul Link Nuzlocke companion scope. Added rules for encounter tracking, randomizer awareness, evolution locking, move calculation, persistence, and quality standards.

6. **Major Soul Link build** (commit `5a7e942`) — This was the bulk of the development:
   - Created `SoulLinkDashboard`, `SoulLinkSlot` with two-player layout
   - Built `PokemonSearch` as a reusable component with availability blocking
   - Created `CompactPokemonCard` for in-slot/graveyard/box display
   - Built `GraveyardPanel` (per-player) with search and sort-by-timestamp
   - Built `BoxPanel` + `BoxPairEditor` for reserve pairs
   - Implemented `EncounterTracker` with `ProgressFilters` and `EncounterLocationCard`
   - Built `PokemonLookupSection` (Battle Helper) with level-up moveset calculation
   - Implemented `evolutionLock.ts` for evolution chain resolution and locking
   - Created `usePersistentRunState.ts` (476 lines) as the central state hook
   - Created `useSlotPokemon.ts` for per-slot fetch lifecycle
   - Built persistence layer: `storage.ts` (localStorage), `exportImport.ts` (JSON)
   - Created `unboundEncounters.ts` with data from the Pokémon Unbound Location Guide
   - Built `encounterFilter.ts` for progress-based encounter filtering
   - Created `levelUpMoves.ts` for level-up move calculations
   - Added `scripts/convertLearnsets.cjs` + `scripts/data/Learnsets.c` for learnset conversion
   - Generated `src/data/generated/unboundLearnsets.ts` (22k+ lines)
   - Heavily expanded `style.css` (~1554 lines added) for dark theme, responsive grid layout
   - Expanded types in `types.ts` (added `SoulLinkSlotData`, `SoulLinkTeam`, `EncounterLocation`, etc.)
   - Updated `App.tsx` to wire everything together with export/import UI and feedback messages
   - Updated `README.md` with setup instructions and known limitations

## Important files changed or created

### Created during this session

| File | Purpose |
|---|---|
| `src/components/SoulLinkDashboard.tsx` | 6-slot dashboard container |
| `src/components/SoulLinkSlot.tsx` | Single linked pair slot with P1/P2 areas |
| `src/components/PokemonSearch.tsx` | Reusable search with autocomplete + availability blocking |
| `src/components/CompactPokemonCard.tsx` | Compact card for slots/graveyard/box |
| `src/components/EmptyPokemonSlot.tsx` | Placeholder for empty slots |
| `src/components/GraveyardPanel.tsx` | Per-player dead Pokémon panel |
| `src/components/BoxPanel.tsx` | Reserve box panel |
| `src/components/BoxPairEditor.tsx` | Reserve pair creation form |
| `src/components/EncounterTracker.tsx` | Location checklist panel |
| `src/components/EncounterLocationCard.tsx` | Single location card with checkbox |
| `src/components/ProgressFilters.tsx` | Encounter filter controls |
| `src/components/PokemonLookupSection.tsx` | Battle Helper / standalone lookup |
| `src/hooks/usePersistentRunState.ts` | Central state management hook (476 lines) |
| `src/hooks/useSlotPokemon.ts` | Per-slot fetch lifecycle |
| `src/utils/evolutionLock.ts` | Evolution chain resolution + locking |
| `src/utils/levelUpMoves.ts` | Level-up move filtering |
| `src/utils/unboundLearnsets.ts` | Wrapper for generated learnset data |
| `src/utils/exportImport.ts` | JSON export/import with validation |
| `src/utils/storage.ts` | localStorage persistence wrapper |
| `src/data/unboundEncounters.ts` | Encounter location data from workbook |
| `src/data/generated/unboundLearnsets.ts` | Auto-generated learnset data (22k+ lines) |
| `src/encounterFilter.ts` | Progress-based encounter visibility |
| `src/generation.ts` | Generation 1–7 filtering + Mega detection |
| `scripts/convertLearnsets.cjs` | C struct → TS learnset converter |
| `scripts/data/Learnsets.c` | Decompiled ROM learnset source (22k+ lines) |

### Heavily modified

| File | Changes |
|---|---|
| `src/App.tsx` | From simple lookup page (~98 lines) to full app wiring (~271 lines) |
| `src/style.css` | From ~296 lines to ~1919 lines (dark theme, grid layout, responsive) |
| `src/types.ts` | From ~59 lines to ~193 lines (all Soul Link, encounter, persistence types) |
| `AGENTS.md` | Expanded from basic spec to full Soul Link specification (~+136 lines) |
| `README.md` | Added setup, deployment, and limitation docs (~+51 lines) |

## Problems encountered

### 1. Learnset data conversion from C source
The decompiled ROM data (`scripts/data/Learnsets.c`) uses C structs that are not straightforward to parse. The conversion script (`scripts/convertLearnsets.cjs`) needed regex-based parsing which can miss edge cases.
- **Assumption:** Some Pokémon may have incomplete learnset data if their C struct format differed from expected patterns.

### 2. Evolution chain API dependency
PokéAPI evolution chain data is fetched at runtime and cached in-memory. A module-level cache means it's lost on page refresh. The lock cannot be enforced if the API is unavailable during a fresh load.
- **Solution:** The hook defaults to allowing selection if the evolution chain fetch fails (conservative failure mode would be better, but not implemented).

### 3. State hook size growth
The central `usePersistentRunState` hook reached 476 lines, handling state, async fetch orchestration, derived set computation, and callback creation. This made it harder to reason about individual features.
- **Trade-off accepted:** Extracting sub-hooks was deferred to keep the initial build moving quickly.

### 4. Autocomplete UX timing
The search component triggers suggestions after 2 characters, but the filtering is synchronous against a cached client-side list. On slow devices, the initial `fetchAllPokemonNames()` call (on first mount) could delay first interaction.
- **Solution:** The name list is fetched once on `PokemonLookupSection` mount and cached at the module level in `api.ts`.

### 5. Regional form data consistency
Regional variants (Alolan Rattata, Galarian Meowth, etc.) have different types/stats than their base forms. The initial implementation used the species endpoint from base species URL, but regional forms have their own species entries in PokéAPI.
- **Solution:** Fixed in commit `567f3af` to properly extract species data from the actual Pokémon form's species URL.

### 6. Import/export versioning
The export format evolved during development. Without a version field, old exports would silently corrupt state on import.
- **Solution:** Added version field (currently v2) with validation that rejects unknown or missing versions. No migration path implemented yet.

### 7. CSS scaling
The stylesheet grew to ~1919 lines in a single file. Without CSS modules or naming conventions, class name collisions became a risk.
- **Status:** Accepted. No collisions observed yet, but it's a maintenance concern.

## Solutions

- **Learnset data:** The conversion script was built as a standalone Node script (`scripts/convertLearnsets.cjs`) that can be re-run if the source data changes. The generated TypeScript file is checked into the repository.
- **Evolution cache:** Module-level `Map` with a comment noting it could be persisted to localStorage in a future iteration.
- **State complexity:** The hook was organized with clear sections: initial state definition, derived set computation, fetch helper, callback creation, and effect for persistence.
- **Regional forms:** Species URL extraction was fixed to use the Pokémon response's `species.url` field rather than deriving it from the Pokémon name.
- **Import safety:** Added `validateImportedRunState()` that checks version and required fields before allowing import.
- **CSS organization:** Styles are organized by component section with comments, following the same order as the component tree.

## Good prompts or instructions

Based on the code structure and patterns, these prompt styles likely worked well:

- **"Implement X following the pattern of Y"** — e.g., "Create a new GraveyardPanel following the pattern of the existing Pokémon card display."
- **"Separate logic from UI"** — e.g., "Move the evolution chain resolution to a separate utility module."
- **"Handle loading, error, and empty states"** — consistently applied to every component that fetches data.
- **"Run npm run build before finishing"** — ensured TypeScript strict mode was satisfied.
- **"Update the types file first"** — adding new types to `types.ts` before writing components established clear contracts.
- **"No new dependencies"** — the app uses only React + Vite + TypeScript, no external UI or state libraries.

## Final result

A complete, buildable, single-page web app at `D:\Projects\pokemon-weakness-app\` that:

- Runs via `npm run dev`
- Builds via `npm run build` (tsc + vite build, zero errors)
- Persists run state to localStorage automatically
- Exports/imports run state as versioned JSON files
- Supports all Gen 1–7 Pokémon (no Megas)
- Includes encounter tracking from the Pokémon Unbound Location Guide
- Uses local learnset data from the decompiled Pokémon Unbound ROM
- Is deployable as a static site to Vercel

## Learnings

1. **AGENTS.md as a living spec works well** — the specification file evolved alongside the code, serving as both a requirements document and a rules file for the AI agent.

2. **Single-file CSS can scale to ~2000 lines** for a focused project — but class naming conventions become important beyond that point.

3. **Tuples enforce invariants at the type level** — `SoulLinkTeam` as a tuple of exactly 6 slots prevented off-by-one errors in slot iteration.

4. **Derived Sets simplify availability checks** — computing `deadNames`, `activeNames`, `boxedNames`, `unavailableNames` from source state and passing them down as props kept blocking logic consistent across 5 search entry points.

5. **Decompiled ROM data is powerful but fragile** — the learnset data from `Learnsets.c` is the most valuable data in the app (actual Unbound moves), but the conversion pipeline depends on parsing C structs with regex, which can break.

6. **PokéAPI is good enough for runtime data** — it's fast, free, and reliable for most use cases. The name list caching pattern avoids repeated API calls for suggestions.

7. **CSS Grid with named areas is excellent for responsive layouts** — the 3-column graveyard/slots/graveyard pattern collapsed cleanly with grid-area-based media queries.

8. **TypeScript strict mode catches real bugs** — `noUnusedLocals` and `noUnusedParameters` in `tsconfig.json` forced clean code.

## Follow-up tasks

- Add PWA support (service worker, offline caching, install prompt)
- Add test suite (Vitest) for core logic modules (generation filter, weakness calc, evolution lock, level-up moves)
- Persist evolution chain cache to localStorage
- Add forward migration for import versions
- Add move-to-slot from Reserve Box
- Add encounter notes per location (record randomized encounters)
- Add light/dark theme toggle
- Add damage calculator
- Extract `usePersistentRunState` into smaller sub-hooks
- Switch to CSS modules or add BEM naming convention
- Handle localStorage `QuotaExceededError` gracefully

## Related notes

- [[Project Overview - Soullink]]
- [[Architecture - Soullink]]
- [[Features - Soullink]]
- [[Lessons Learned - Soullink]]
- [[Big Pickle]]
- [[OpenCode]]
