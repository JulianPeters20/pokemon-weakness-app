# Features - Soullink

## Pokémon Selection

### Description
Users search for Pokémon by name to fill Soul Link slots, Graveyard entries, Box pairs, or the Battle Helper lookup. Selection is restricted to Generations 1–7, and Mega Pokémon are excluded. Blocked Pokémon (dead evolution line, already on team, already in Box) show a specific rejection message.

### Relevant files
- `src/components/PokemonSearch.tsx` — reusable search component with autocomplete dropdown
- `src/components/SearchBar.tsx` — text input + suggestion list UI
- `src/generation.ts` — `isSupportedGeneration()`, `isMega()`, `getGenerationFromId()`
- `src/api.ts` — `fetchAllPokemonNames()` for the cached name list

### Important behavior
- Suggestions appear after 2+ characters typed, filtered client-side from a cached list of all PokéAPI Pokémon names
- Generation filtering uses both species ID ranges and the PokéAPI species endpoint generation field as fallback
- Mega detection is name-based: checks for "mega" in the name (e.g., "charizardmegax", "mewtwo-mega-y")
- Blocked Pokémon (those in `lockedNames` Set) are displayed in the suggestion list but show a tooltip/rejection on selection
- Direct search for unsupported Pokémon returns an error message specifying the generation ("Generation 8 is not supported")
- The suggestion list is capped at 10 results

### Possible improvements
- Add debounce to the search input to reduce re-renders on every keystroke
- Show type icons or sprites in the suggestion dropdown for faster visual identification
- Cache the valid Pokémon list in localStorage so it survives page refresh
- Allow searching by Pokédex number as well as name

---

## Soul Link Pairing

### Description
The core feature: 6 linked pair slots. Each slot holds one Pokémon for Player 1 and one for Player 2, visually grouped together in a card. The slot number identifies which pair it is.

### Relevant files
- `src/components/SoulLinkDashboard.tsx` — container rendering all 6 slots
- `src/components/SoulLinkSlot.tsx` — single slot with two player areas
- `src/types.ts` — `SoulLinkSlotData`, `SoulLinkTeam` (tuple of exactly 6)
- `src/hooks/usePersistentRunState.ts` — handles selection, clearing, death marking for slots

### Important behavior
- The team is always exactly 6 slots; no adding or removing slots
- Each slot has a `fainted` field: `"none" | "player1" | "player2" | "both"`
- When a slot is marked dead, both Pokémon are moved to their respective graveyards and the slot is cleared
- Slots have optional `route` and `notes` metadata (not rendered in the current UI, but present in the data model)

### Possible improvements
- Add route/notes inline editing per slot
- Allow reordering slots via drag-and-drop
- Add a visual indicator for which slots have fainted status
- Show total team type coverage or overlap warnings

---

## Player Management

### Description
There are two players implicitly modeled in the app. Each player has their own graveyard panel and occupies one half of each Soul Link slot. There are no player profiles, settings, or identity beyond these two roles.

### Relevant files
- `src/App.tsx` — renders two `GraveyardPanel` instances, one per player
- `src/components/GraveyardPanel.tsx` — per-player dead Pokémon panel
- `src/components/SoulLinkSlot.tsx` — two player areas per slot (`"player1"`, `"player2"`)
- `src/types.ts` — `DeadPokemon.player` field is `"player1" | "player2" | "unknown"`

### Important behavior
- Players are not a first-class entity — there is no player object, name, or configuration
- Player 1's graveyard is rendered on the left of the dashboard grid; Player 2's on the right
- Evolution locking is shared between both players: one player's dead Pokémon locks the line for both

### Possible improvements
- Allow custom player names or initials displayed on graveyards and slot labels
- Add a per-player encounter history view
- Distinguish player identities in the export data more clearly

---

## Encounter Tracking

### Description
A location-based encounter checklist derived from the Pokémon Unbound Location Guide workbook. Users mark locations as used/completed as they progress through the game. The tracker is randomizer-aware: listed Pokémon are reference only, and the user records what they actually encountered.

### Relevant files
- `src/components/EncounterTracker.tsx` — main tracker panel
- `src/components/EncounterLocationCard.tsx` — single location card with checkbox
- `src/components/ProgressFilters.tsx` — filter controls (badges, rods, toggles)
- `src/data/unboundEncounters.ts` — static encounter location data (~558 lines)
- `src/encounterFilter.ts` — `filterEncountersByProgress()` logic
- `src/types.ts` — `EncounterLocation`, `EncounterMethod`, `EncounterRequirement`, `EncounterCategory`, `ProgressFilters`, `RandomizedEncounterRecord`

### Important behavior
- Locations are filtered by progress: badge count, postgame status, rod level, surf/rock-smash/underwater/adm/devon-scope availability, and encounter category toggles
- Locked locations (missing requirements) are hidden by default; a toggle shows them with lock reasons
- Each location card shows: name, category, encounter methods (color-coded), unlock requirements, vanilla reference Pokémon
- The header shows a live count: "X / Y used"
- The data includes multiple encounter categories: grass-cave, surf, fishing (3 rod tiers), rock-smash, gift, static, mission-reward, legendary, trade, game-corner, swarm

### Possible improvements
- Add a text input per location to record the actual randomized encounter
- Group locations by map area or route number for easier navigation
- Add a search/filter bar for location names
- Include swarm schedule data (day-of-week-dependent encounters)

---

## Team Management

### Description
The active team is exactly 6 Soul Link pairs, tracked in the dashboard. Pokémon not on the active team can be stored in the Reserve Box as linked pairs.

### Relevant files
- `src/components/SoulLinkDashboard.tsx` — active team display
- `src/components/BoxPanel.tsx` — reserve box panel
- `src/components/BoxPairEditor.tsx` — form to add a new reserve pair
- `src/types.ts` — `BoxPairData`, `SoulLinkTeam`
- `src/hooks/usePersistentRunState.ts` — add/remove box pairs, mark box pairs dead

### Important behavior
- Box pairs are fully independent of active team slots; adding/removing them does not affect slot count
- Box pairs can be marked dead, which moves both Pokémon to their graveyards and removes the pair
- Box pairs have `route` and `notes` fields
- **Unclear:** There is no UI to move a box pair back to an active slot. The user would need to clear a slot and manually re-select.

### Possible improvements
- Add "move to slot" action for box pairs (assign to an empty or selected slot)
- Allow box pair reordering
- Show box pair count limit or warning

---

## Status Handling (Death & Evolution Lock)

### Description
When a Soul Link pair dies, both Pokémon are moved to their respective Graveyard panels. Any Pokémon in a Graveyard locks its entire evolution line for both players — no member of that line can be selected anywhere in the app.

### Relevant files
- `src/components/GraveyardPanel.tsx` — per-player dead Pokémon display
- `src/components/CompactPokemonCard.tsx` — dead Pokémon card (with remove button)
- `src/utils/evolutionLock.ts` — `buildEvolutionLine()` resolves evolution chains via PokéAPI
- `src/hooks/usePersistentRunState.ts` — derived `deadNames`, `activeNames`, `boxedNames`, `unavailableNames` Sets

### Important behavior
- Evolution chain is fetched from PokéAPI `/evolution-chain/{id}` and cached in a module-level `Map`
- Removing a Pokémon from the Graveyard unlocks its evolution line (unless another member of that line is still dead)
- Examples: Charmander dead → Charmander, Charmeleon, Charizard all locked. Eevee dead → Eevee + all 8 Eeveelutions locked
- The evolution cache is session-only: lost on page refresh
- Death confirmation requires two clicks (skull icon → confirm dialog)
- Graveyard entries are sorted newest-first by timestamp

### Possible improvements
- Persist evolution chain cache to localStorage to avoid re-fetches
- Add a visual indicator on the dashboard when a slot has been marked dead
- Allow adding dead Pokémon with cause of death and level metadata
- Add a "revive" confirmation step

---

## Data Persistence

### Description
All run state is automatically saved to localStorage on every change. On app load, the saved state is restored. There is no manual save button.

### Relevant files
- `src/utils/storage.ts` — `saveToStorage()` and `loadFromStorage()` wrappers
- `src/hooks/usePersistentRunState.ts` — `useEffect` triggers save on state change

### Important behavior
- The save key is `soul-link-run-state`
- The save effect uses `JSON.stringify(state)` as the useEffect dependency — only fires when state actually changes
- On load, if no saved state exists, defaults are used (empty slots, empty graveyards, default filters)
- **Unclear:** There is no error handling for `QuotaExceededError` — if localStorage is full, saves silently fail

### Possible improvements
- Show a warning toast when localStorage quota is approaching the limit
- Compress cached Pokémon data before serialization (store only essential fields)
- Add an "auto-save" indicator in the UI

---

## UI Layout

### Description
Single-page layout with all sections stacked vertically. The dashboard section uses a 3-column CSS Grid with Player 1 Graveyard on the left, active team slots in the center, and Player 2 Graveyard on the right. Below the dashboard are the Reserve Box, Encounter Tracker, export/import controls, and Battle Helper.

### Relevant files
- `src/App.tsx` — overall page structure
- `src/style.css` — all layout styles, responsive breakpoints, grid definitions
- `src/components/SoulLinkDashboard.tsx` — dashboard container

### Important behavior
- At 1024px and below, the graveyard panels move above and below the slots column
- At 640px and below, everything stacks in a single column
- Dark theme throughout via CSS custom properties (`--bg: #0f172a`, `--accent: #60a5fa`, etc.)
- All component states (empty, loading, error, loaded) have distinct visual styles

### Possible improvements
- Add a collapsible section for each major area (encounter tracker, box, battle helper)
- Add a sticky header or progress bar
- Support light/dark theme toggle
- Add smooth transitions for state changes

---

## Filtering and Searching

### Description
Two independent filtering systems: (1) Pokémon search autocomplete for selection, which filters by generation and availability; (2) Encounter location filters based on in-game progress.

### Relevant files
- Pokémon filtering: `src/generation.ts`, `src/api.ts`, `src/components/PokemonSearch.tsx`
- Encounter filtering: `src/encounterFilter.ts`, `src/components/ProgressFilters.tsx`, `src/data/unboundEncounters.ts`

### Important behavior
- Pokémon autocomplete: client-side filter from cached list, capped at 10 suggestions, appears at ≥2 characters
- Mega Pokémon are stripped from the suggestion list entirely (not just blocked on selection)
- Encounter filtering: location visibility is computed by `filterEncountersByProgress()` which checks each location's `requirements` array against the current `ProgressFilters`
- Requirements include: badge count threshold, postgame flag, rod level minimum, key item toggles (surf, rock smash, underwater, ADM, Devon Scope), mission completion, weekday/daily/time constraints
- Locked locations show the specific reason(s) they are unavailable when "Show Locked" is enabled

### Possible improvements
- Add a "fuzzy" search to the Pokémon autocomplete (tolerate typos)
- Add encounter location search by name
- Show encounter location count per category

---

## Import and Export

### Description
Users can export their entire run state as a JSON file for backup or sharing with their co-player. Importing a JSON file overwrites the current local state after a confirmation prompt.

### Relevant files
- `src/utils/exportImport.ts` — `exportRunState()`, `validateImportedRunState()`, `readFileAsText()`
- `src/App.tsx` — export/import UI, file input, confirmation dialogs

### Important behavior
- Export format is versioned (currently version 2)
- Exported data includes: slots, graveyard entries, box pairs, encounter filters, used location keys, show-locked toggle
- Import validates: checks for `version` field, validates top-level structure
- Import shows a confirmation dialog: "Import will overwrite current run. Continue?"
- Reset clears all localStorage data with a confirmation step
- The file input accepts `.json` files only
- Feedback messages appear for 4 seconds on success or error

### Possible improvements
- Add forward migration for older export versions instead of rejecting them
- Add an "export to clipboard" option for quick sharing
- Auto-backup before import (save current state as a backup before overwriting)
- Include version history in export data

---

## Type Effectiveness Calculator

### Description
When a Pokémon is selected, its type weaknesses, resistances, and immunities are calculated using live data from PokéAPI. Dual-type damage multipliers are correctly combined (e.g., 4x, 0.25x, etc.). Results are displayed grouped by multiplier value.

### Relevant files
- `src/weakness.ts` — `combineDamageRelations()` and `calculateWeaknesses()`
- `src/api.ts` — `fetchTypeData()` for damage relation data
- `src/components/TypeBadge.tsx` — type badge display with optional multiplier text
- `src/components/PokemonCard.tsx` — full weakness display in Battle Helper
- `src/components/CompactPokemonCard.tsx` — compact weakness display in slots

### Important behavior
- Data is fetched from PokéAPI `/type/{name}` per type of the selected Pokémon
- `combineDamageRelations()` merges double-damage-from, half-damage-from, and no-damage-from arrays across all types
- `calculateWeaknesses()` multiplies factors: 2×double + 2×half + 0×immunity, grouped by final multiplier
- Immunities (0x) suppress lower-priority entries: if a type has both immunity and resistance to something, immunity wins
- No duplicate type entries appear in the output

### Possible improvements
- Add STAB (Same Type Attack Bonus) indicator
- Include offensive type coverage (which types this Pokémon's moves are strong against)
- Cache type data in localStorage to reduce API calls
- Show type matchup against a user-specified opponent type

---

## Battle Helper / Pokémon Lookup

### Description
A standalone section at the bottom of the page where users can search any Pokémon (Gen 1–7, no Megas) to view its stats, types, weaknesses, and level-up moveset. This is strictly informational and does not affect the active team, graveyard, box, or encounter state.

### Relevant files
- `src/components/PokemonLookupSection.tsx` — search, display, level input, moveset list
- `src/components/PokemonCard.tsx` — full card layout for lookup results
- `src/utils/levelUpMoves.ts` — `getCurrentMoveset()` for last-4-moves calculation
- `src/utils/unboundLearnsets.ts` — wrapper for generated Unbound learnset data

### Important behavior
- Level input (1–100) controls which level-up moves are shown
- Only `level-up` learn method moves are included (no TM, egg, tutor, machine, or evolution moves)
- Current moveset = the last 4 level-up moves sorted by level (ascending), with deterministic ordering for same-level moves
- All eligible level-up moves are shown in an expandable details section
- A label indicates whether the data is "Pokémon Unbound learnset" or "Reference data" (official PokéAPI fallback)
- The lookup does not interact with any run state — it is safe to use at any time

### Possible improvements
- Show move type, power, accuracy, and PP for each move
- Add a visual comparison between two Pokémon
- Allow searching by type (show all Pokémon of a given type)
- Show which TMs/HMs the Pokémon can learn

---

## Related notes

- [[Project Overview - Soullink]]
- [[Architecture - Soullink]]
- [[Final State - Soullink]]
- [[ADR Candidates - Soullink]]
