# Project Overview - Soullink

## One-sentence summary

A local-first single-page web app for two players to manage a randomized Pokémon Unbound Soul Link Nuzlocke run, tracking linked pairs, deaths, and encounters without requiring a backend or accounts.

## Purpose

This app exists to solve the bookkeeping overhead of a Soul Link Nuzlocke in Pokémon Unbound. In a Soul Link challenge, two players each catch a Pokémon at every encounter location and link them into pairs — if one Pokémon dies, both are lost. The challenge adds layers of tracking: which encounters are still available, which Pokémon have died (locking their entire evolution line), and what each Pokémon's current type matchups and moves are. This app replaces paper notes and spreadsheets with a live dashboard.

## Current status

Completed. Every feature defined in the project specification (`AGENTS.md`) is implemented and verified to build without errors via `npm run build`. The app is deployable as a static site. No major features are known to be missing relative to the original scope.

## Core features

- **Soul Link Dashboard** — exactly 6 linked pair slots, each with a Player 1 and Player 2 Pokémon
- **Pokémon Search & Autocomplete** — filters to Generations 1–7, excludes Mega Pokémon, shows availability status
- **Pokémon Cards** — compact cards showing sprite, types, base stats, and type weaknesses grouped by multiplier
- **Encounter Tracker** — location checklist derived from the Pokémon Unbound Location Guide, filterable by progress (badges, rods, surf, postgame, etc.)
- **Graveyard** — separate dead-Pokémon panels per player, enforcing evolution-line locking
- **Reserve Box** — store extra linked pairs not currently on the active team
- **Battle Helper** — standalone Pokémon lookup with stats, weaknesses, and level-based moveset calculation
- **Evolution-Line Lock** — if any Pokémon is dead, its entire evolution chain is unavailable for both players
- **Export/Import/Reset** — JSON export for sharing or backup, import with validation, full reset
- **Local Persistence** — automatic save to localStorage, no manual saving needed

## Main user flow

1. Open the app. The dashboard shows 6 empty Soul Link slots.
2. For each slot, Player 1 clicks their empty slot area and searches for a Pokémon (min 2 characters triggers suggestions).
3. Selecting a Pokémon fetches its data from PokéAPI and displays a compact card with sprite, types, stats, and weaknesses. Player 2 does the same for their linked Pokémon.
4. During gameplay, when a pair dies, the user clicks the skull icon and confirms. Both Pokémon move to their respective Graveyard panels.
5. The user tracks encounters by opening the Encounter Tracker section, setting their current progress filters (badges, rods, etc.), and checking off locations as used.
6. Boxed or reserve pairs are managed in the Reserve Box section.
7. For quick type/move reference, the user opens the Battle Helper at the bottom of the page, searches a Pokémon, and optionally enters a level to see the current four-move moveset.
8. The user can export their run to a JSON file at any time to share with their co-player or as a backup.

## Important project files

| Path | Purpose |
|---|---|
| `AGENTS.md` | The canonical project specification; defines all rules and constraints |
| `src/App.tsx` | Root component wiring all sections together |
| `src/hooks/usePersistentRunState.ts` | Single source of truth for all run state (476 lines) |
| `src/api.ts` | PokéAPI fetch client |
| `src/generation.ts` | Generation 1–7 filtering and Mega detection |
| `src/weakness.ts` | Type effectiveness calculation (dual-type multipliers, immunities) |
| `src/utils/evolutionLock.ts` | Evolution chain resolution and dead-line locking |
| `src/data/unboundEncounters.ts` | Encounter location data from the Pokémon Unbound Location Guide |
| `src/data/generated/unboundLearnsets.ts` | Auto-generated level-up move data from decompiled ROM (large file) |
| `scripts/convertLearnsets.cjs` | Conversion script that generates the learnset data from C source |
| `src/style.css` | All styles in one file (~1919 lines), dark theme, responsive CSS Grid |
| `src/types.ts` | All TypeScript type definitions (193 lines) |
| `src/components/PokemonSearch.tsx` | Reusable search/autocomplete component used in 5 places |
| `src/components/SoulLinkSlot.tsx` | Single linked pair slot with Player 1/Player 2 areas |
| `src/components/GraveyardPanel.tsx` | Per-player dead Pokémon panel |

## Technical summary

- **Framework:** React 19 + TypeScript 6 + Vite 8. No UI libraries, no state managers, no backend.
- **Storage:** localStorage via a thin wrapper in `src/utils/storage.ts`. Export/import via JSON files.
- **Styling:** Single CSS file (`src/style.css`) with CSS custom properties for dark theme and CSS Grid for layout.
- **Data sources:** PokéAPI (runtime fetch for stats, types, sprites, evolution chains); local static data for encounter locations (from the Unbound Location Guide workbook) and level-up moves (from decompiled ROM).
- **App structure:** Single-page app. `App.tsx` renders all sections vertically: Soul Link Dashboard (with flanking Graveyard panels) → Box → Encounter Tracker → Export/Import controls → Battle Helper.

## Known limitations

- The app requires internet access for PokéAPI (except for locally cached encounter location names and learnset data).
- The auto-generated learnset data may have gaps for some Pokémon. The app shows "Reference data" when no Unbound learnset is available.
- Evolution chain data comes from PokéAPI and may not reflect custom evolutions in Pokémon Unbound (e.g., trade evolutions changed to level-up).
- localStorage is limited to ~5–10 MB; very long runs with many cached Pokémon could approach this limit.
- **Unclear:** Whether every Gen 1–7 Pokémon has complete learnset data in the generated file — the conversion script may miss some species due to name mismatches.
- **Unclear:** Whether the encounter location data covers every possible encounter in Pokémon Unbound — the workbook may have omissions.

## Future improvement ideas

- **PWA support** — service worker for offline caching of PokéAPI data, installable on mobile
- **Multiplayer sync** — share run state between two devices via WebRTC or a cloud sync layer
- **Test suite** — add Vitest or similar and cover the core logic modules (generation filtering, weakness calc, evolution lock, level-up moves)
- **Evolution chain cache persistence** — save cached evolution chains to localStorage so they survive page reloads
- **Import version migration** — add forward migration path for old export versions instead of rejecting them
- **Dark/Light theme toggle** — support a light theme via CSS custom properties
- **Notes per encounter location** — allow user to record what they actually encountered at each location
- **Damage calculator** — integrate type effectiveness, STAB, and base power into a quick damage range estimator

## Related notes

- [[Architecture - Soullink]]
- [[Features - Soullink]]
- [[Final State - Soullink]]
- [[Lessons Learned - Soullink]]
- [[Agent Context - Soullink]]
