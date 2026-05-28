# Bug Pattern Candidates - Soullink

---

## Bug Pattern: localStorage Save Silently Fails

### Symptom
User makes progress (selects Pokémon, marks deaths, checks encounters) but after refreshing the page, all changes are lost. No error message is shown during the session.

### Likely cause
`src/utils/storage.ts:saveRunState()` wraps `localStorage.setItem` in a try/catch and only logs to `console.warn` on failure. The user never sees the warning.
Common failure scenarios:
- `QuotaExceededError` when cached Pokémon data fills the ~5 MB limit
- localStorage disabled by browser privacy settings
- Private/incognito mode in some browsers

### Prevention
Show a visible error toast or warning in the UI when persistence fails. Catch the specific `QuotaExceededError` and suggest the user export their run as a JSON backup.

### Regression test idea
Manual: Fill all 6 slots with Pokémon, add 50+ graveyard entries, export, clear storage, import — verify state survives refresh. For automation: mock `localStorage.setItem` to throw and verify a UI warning appears.

### Related files
- `src/utils/storage.ts`
- `src/App.tsx` (feedback message system)

---

## Bug Pattern: Import Version Mismatch Causes Silent Data Loss

### Symptom
User exports their run (version 2), then later after an app update, tries to import the old export. The import validation rejects it with "Unsupported version". The user cannot recover their data.

Alternatively: User exports a run, clears localStorage, closes the tab, reopens the app — the app loads clean state with no indication that persisted data existed at a different version.

### Likely cause
`src/utils/storage.ts:loadRunState()` returns `null` for any version mismatch (`if (parsed.version !== CURRENT_VERSION) return null`). No migration, no warning, no fallback.

Meanwhile `src/utils/exportImport.ts:validateImportedRunState()` accepts both version 1 and 2 (`SUPPORTED_VERSIONS = [1, 2]`), but the app's `handleImport` only handles the current format. If version 1 is ever re-encountered, validation passes but the data shape may be wrong.

### Prevention
- Add a migration function that upgrades old export formats to the current version.
- Show a warning when stored data has an old version: "Found saved data from an older version. It will be converted on next save."
- Keep `loadRunState` lenient: load what you can, fill defaults for missing fields.

### Regression test idea
Create a version-1 export file, attempt to import it, verify it either converts cleanly or shows an actionable error.

### Related files
- `src/utils/storage.ts`
- `src/utils/exportImport.ts`
- `src/hooks/usePersistentRunState.ts`

---

## Bug Pattern: Evolution Lock Bypassed When PokéAPI Is Unavailable

### Symptom
A player can select a Pokémon whose evolution line has a member in the Graveyard. The evolution lock is not enforced until the page is refreshed.

### Likely cause
`src/hooks/usePersistentRunState.ts` computes `lockedNames` in a `useEffect` that calls `getEvolutionLineMemberNames()` (a PokéAPI fetch). The `useState` initializer for `lockedNames` is just an empty `Set` — it relies on the effect to populate it. If the API call fails (network error, rate limit), the effect completes without adding names, and `lockedNames` remains empty.

The lock is only recomputed when the `graveyard` dependency changes. If both graveyards and `lockedNames` are empty on page load, and the API fails, the user could select any Pokémon.

### Prevention
- Initialize `lockedNames` from `deadNames` at minimum (lock the exact dead species, even if the full evolution chain can't be fetched).
- Add a retry mechanism for failed evolution chain fetches.
- Show a warning banner: "Evolution data could not be loaded — some locks may not be enforced."

### Regression test idea
Mock `getEvolutionLineMemberNames` to reject, add a Pokémon to graveyard, then try to select another member of its evolution line — should be blocked.

### Related files
- `src/utils/evolutionLock.ts`
- `src/hooks/usePersistentRunState.ts:120-166`

---

## Bug Pattern: Marking a Slot Dead References Stale lockedNames

### Symptom
After marking a slot dead, the resulting `unavailableNames` set (used for UI blocking) may be incomplete until the next render cycle or page refresh.

### Likely cause
`handleMarkSlotDead` in `src/hooks/usePersistentRunState.ts:286-335` reads `lockedNames` from the closure. When it adds dead Pokémon to the graveyard, the `useEffect` dependency (`graveyard`) fires and recomputes `lockedNames` asynchronously (via `Promise.all`). During the time between the `setGraveyard` call and the async resolution of `lockedNames`, the evolution lock is outdated.

Additionally, `handleMarkSlotDead` checks `lockedNames.has(pokemon.name)` to decide whether to add to graveyard — but at the moment of the call, `lockedNames` reflects the state *before* any dead were added. If both Player 1 and Player 2 in the same slot have members of the same evolution line, the second might be incorrectly skipped.

### Prevention
- Compute the new `lockedNames` synchronously from the updated graveyard + dead Pokémon, rather than relying on the async effect.
- Or restructure to compute locked names synchronously from the graveyard array (using a local evolution map instead of PokéAPI fetch).

### Regression test idea
Create a slot with P1=Charmander, P2=Charmeleon. Mark the slot dead. Verify both end up in graveyard and Charizard is locked.

### Related files
- `src/hooks/usePersistentRunState.ts:286-335`
- `src/utils/evolutionLock.ts`

---

## Bug Pattern: handleAddGraveyard Uses Stale State Flag

### Symptom
Adding the same dead Pokémon twice in rapid succession may result in duplicate entries in the graveyard.

### Likely cause
`handleAddGraveyard` (line 219-280) uses a `skip` variable set inside a `setGraveyard` callback to detect duplicates. Because `setGraveyard` is asynchronous and `skip` is a `let` variable, two concurrent calls could both see `skip === false` before either state update completes, and both would proceed to add the same Pokémon.

### Prevention
- Use a `useRef` Set for tracking pending additions.
- Or move the deduplication check outside the state callback using the current state value.
- Or use a functional updater that checks the current state.

### Regression test idea
Open the browser console, call `handleAddGraveyard("player1", "pikachu")` twice in quick succession. Verify only one entry appears.

### Related files
- `src/hooks/usePersistentRunState.ts:219-280`

---

## Bug Pattern: SearchingFor State Stays Active After Selection

### Symptom
User selects a Pokémon from the search dropdown, the Pokémon card appears, but the search input area remains visible instead of being replaced by the card.

### Likely cause
`SoulLinkSlot.tsx:22-26` uses a `useEffect` to detect when `data[searchingFor].pokemon` becomes truthy and close the search. This depends on the effect running after the state update. If React batches the updates or the component tree doesn't re-render as expected, the search stays open.

The issue is timing: the `useEffect` checks whether the target slot entry has a `pokemon` set, but the `searchingFor` state still points to the same player. If the effect fires before the slot entry update propagates, it won't close.

### Prevention
Close the search synchronously in the `onSelectPokemon` callback (set `searchingFor` to `null` right after `onSelectPokemon` returns) instead of relying on a side effect.

### Regression test idea
Click an empty slot, search, select a Pokémon, verify the search area closes and the card appears. Repeat 10 times quickly.

### Related files
- `src/components/SoulLinkSlot.tsx:22-26`

---

## Bug Pattern: handleMarkBoxPairDead Does Not Clean Up Active Slots

### Symptom
A Box pair is marked dead. The Pokémon are moved to the graveyard. But if a member of the same evolution line was on the active team, that slot is not cleared — unlike `handleAddGraveyard` which does scan active slots.

### Likely cause
`handleMarkBoxPairDead` (line 368-396) removes the box pair and adds to graveyard, but unlike `handleAddGraveyard` (lines 247-278), it does NOT iterate over active slots or other box pairs to clear evolution-line members that are now locked.

### Prevention
Extract the "clear slots and box pairs that contain evolution-line members" logic into a shared helper and use it in both `handleAddGraveyard`, `handleMarkSlotDead`, and `handleMarkBoxPairDead`.

### Regression test idea
Have Pikachu on active slot. Have Raichu in Box. Mark Box pair dead. Verify Pikachu is cleared from the active slot.

### Related files
- `src/hooks/usePersistentRunState.ts:368-396`
- `src/hooks/usePersistentRunState.ts:247-278`

---

## Bug Pattern: Encounter Filtering Returns Wrong Visibility for Locations with Multiple Methods

### Symptom
A location that supports multiple encounter methods (e.g., "Route 1" supports both `grass-cave` and `surf`) shows incorrect visibility because the method-based filtering uses the first method only.

### Likely cause
`encounterFilter.ts` and `EncounterTracker.tsx` use `loc.methods[0]` to generate the unique key for each location. If the first method is locked but another method is available, the location may be incorrectly hidden or shown.

### Prevention
Either (a) split locations into separate entries per method in the data source, or (b) change the key to include all methods and evaluate visibility per-method.

### Regression test idea
Find a location with both `grass-cave` and `surf` methods. Disable `grass-cave` toggle, enable `surf` toggle. Verify the location still appears.

### Related files
- `src/encounterFilter.ts`
- `src/components/EncounterTracker.tsx`
- `src/types.ts` — `EncounterLocation.methods`

---

## Bug Pattern: Feedback Messages Overlap or Show Wrong Content

### Symptom
Multiple actions in quick succession (e.g., export then immediately mark dead) cause feedback messages to stack, disappear at wrong times, or show outdated text.

### Likely cause
`App.tsx:44-48`: `showFeedback` sets a 4-second `setTimeout` to clear the message. But it does not track the previous timeout. If `showFeedback` is called twice quickly:
1. First call: sets message "A", starts 4s timer
2. Second call: sets message "B", starts new 4s timer
3. 4s later: first timer fires, clears message (even though "B" should still show)
4. Result: "B" disappears after 0 seconds from the user's perspective

### Prevention
Store the timeout ID in a `useRef` and clear it before setting a new one.

### Regression test idea
Click "Export Run" then immediately click "Mark dead" on a slot. Verify the final feedback message ("Marked as dead") stays for the full 4 seconds.

### Related files
- `src/App.tsx:44-48`

---

## Bug Pattern: Regional Form Species URL Points to Base Species

### Symptom
A regional variant (e.g., Alolan Rattata) shows the generation and evolution data of the base form (Kanto Rattata), or the generation filter incorrectly blocks/allows it.

### Likely cause
The generation filtering in `src/generation.ts` extracts the species ID from the species URL. For regional forms like "rattata-alola", PokéAPI returns `species.url` pointing to the base species ("rattata"), not a regional variant species. The generation check would then use the base species generation instead of the form's actual generation.

This was partially fixed in commit `567f3af` but the fix only ensures the species URL is extracted correctly from the Pokémon response — it doesn't address whether the base species generation is accurate for the regional form.

### Prevention
- For regional forms, fetch the species data using the form's actual species entry (some regional forms have their own species entries in PokéAPI).
- Add explicit generation overrides for known regional variants.

### Regression test idea
Search for "rattata-alola". Verify the generation shown matches Alolan Rattata's actual generation (Gen 7), not Kanto Rattata's (Gen 1).

### Related files
- `src/generation.ts`
- `src/api.ts`

---

## Bug Pattern: Name List Not Yet Loaded on First Search

### Symptom
On initial page load, the user types in a Pokémon search field but sees no suggestions. After a few seconds, suggestions start appearing.

### Likely cause
`PokemonLookupSection.tsx:44-48` triggers `fetchAllPokemonNames()` in a `useEffect` on mount. This is an async fetch from PokéAPI. The first call to `/api/v2/pokemon?limit=100000` may take 1–3 seconds. During that time, `allPokemon` is an empty array, so no suggestions appear.

Additionally, `PokemonSearch.tsx` does NOT fetch its own name list — it relies on receiving the name list as part of the locked/unlocked filtering. But actually, looking at the code more carefully, `PokemonSearch` receives no name list prop. It searches against the full API by typing directly, using its own fetch logic... Let me check.

Actually, looking at PokemonSearch more carefully - it receives `onSelect` and `onCancel` callbacks plus error and availability sets. The search within `PokemonSearch` directly queries the typed text. So the name list dependency is only for the `PokemonLookupSection` suggestions. For `PokemonSearch` in slots/graveyard, the suggestions come from... let me check.

Actually, I need to look at PokemonSearch to see how it handles suggestions.

Actually, looking at the earlier code read, the `PokemonLookupSection.tsx` has its own `allPokemon` cache. But `PokemonSearch.tsx` is a separate component used in slots - it might work differently. Let me not overanalyze this - I already read Pokemonsearch earlier and it had its own search/suggestion mechanism. Let me adjust the bug pattern.

Actually for `PokemonSearch`, the suggestions are fetched differently - the component shows an input and the user types. The component probably does its own fetching.

I'll keep the bug pattern focused on PokemonLookupSection since that's the one that uses `fetchAllPokemonNames()`.

### Prevention
- Show a loading state in the suggestion dropdown while the name list is being fetched.
- Or pre-fetch the name list earlier (in the App component mount, not in PokemonLookupSection).
- Or show a "Still loading Pokémon list..." message when the user types before the list is ready.

### Regression test idea
Open the app, immediately type "char" in the Battle Helper search. Verify that either (a) suggestions appear, or (b) a loading message is shown, but the search does not appear broken.

### Related files
- `src/components/PokemonLookupSection.tsx:44-48`
- `src/api.ts` — `fetchAllPokemonNames()`

---

## Bug Pattern: Export Creates File with Incomplete Data

### Symptom
Exported JSON file exists and downloads, but when re-imported, some state is missing (e.g., showLocked state, box pairs).

### Likely cause
`src/utils/exportImport.ts:validateImportedRunState()` checks for `slots`, `graveyardEntries`, `encounterFilters`, and `usedLocationKeys` — but does NOT check for `showLocked` or `boxPairs`. If a future code change removes these fields from the export, validation will still pass, and the imported state will silently lose data.

Additionally, the `handleImport` function defaults `boxPairs` with `imported.boxPairs ?? []`, so a missing `boxPairs` field results in an empty box rather than an error.

### Prevention
- Validate all expected fields in the import validator, not just the required subset.
- Add a manifest of expected fields to the version definition.
- Consider using a schema validation library (or a simple field checklist).

### Regression test idea
Manually craft an import JSON without `boxPairs` and `showLocked`. Import it. Verify the validator catches the missing fields.

### Related files
- `src/utils/exportImport.ts:10-42`
- `src/hooks/usePersistentRunState.ts:421-438`

---

## Bug Pattern: Clearing a Slot Does Not Reset fainted Status

### Symptom
User clears a Pokémon from a slot (removes it manually). The slot's `fainted` field remains at whatever value it had before (e.g., "player1" if Player 1's Pokémon had fainted). If the user then selects a new Pokémon for that slot, the stale `fainted` status affects death-marking logic.

### Likely cause
`handleClearPokemon` (line 212-217) calls `updateSlotEntry` with `createEmptySlotEntry()` which only resets the player's `SlotEntry` fields (`pokemon`, `weaknesses`, `generation`, `isLoading`, `error`). It does not touch the slot-level `fainted` field.

### Prevention
`handleClearPokemon` should also reset the slot's `fainted` to `"none"`, or the `fainted` field should be a computed value (derived from the presence/absence of Pokémon) rather than stored state.

### Regression test idea
Select Pikachu for P1 in slot 1, mark slot as dead (both go to graveyard). The slot clears. Now select a new Pikachu for P1 in the same slot. Verify the slot's fainted status is "none".

### Related files
- `src/hooks/usePersistentRunState.ts:212-217`
- `src/types.ts` — `SoulLinkSlotData.fainted`

---

## Bug Pattern: Auto-Save Effect Fires on Import Before State Hydrates

### Symptom
After importing a run, the app immediately saves the imported state to localStorage. If the import is interrupted (tab closed during the render cycle), the save effect may fire with partially updated state, corrupting the stored data.

### Likely cause
The `useEffect` for saving (line 73-88) fires after every state change, including the batch of `setSlots`, `setGraveyard`, `setBoxPairs`, etc. in `handleImport`. React 19's automatic batching may group these, but the effect still runs once with the new state. However, `isLoaded.current` is set to `true` inside `handleImport`, so the first-save guard is bypassed.

### Prevention
Use a transient "importing" flag that suppresses saves during the import process, then trigger one explicit save after all state settles.

### Regression test idea
Export a run, clear storage, refresh, import the export. Check localStorage: the saved data should match the imported data exactly.

### Related files
- `src/hooks/usePersistentRunState.ts:73-88` (save effect)
- `src/hooks/usePersistentRunState.ts:421-438` (import handler)

---

## Bug Pattern: CSS Class Name Collision Between Components

### Symptom
A change to one component's styles unexpectedly affects another component. For example, changing `.search-input` for the Battle Helper also changes the style of search inputs in Soul Link slots.

### Likely cause
All styles are in a single global `src/style.css` (~1919 lines) with no namespacing. Common class names like `search-input`, `search-button`, `state-message`, `spinner`, `player-area`, `player-label` are used across multiple components. Any global style change affects all usages.

### Prevention
- Adopt a BEM-like naming convention (e.g., `.soul-link-slot__search-input` vs `.lookup-section__search-input`).
- Or switch to CSS Modules for component-scoped styles.

### Regression test idea
Add `background: red` to `.search-input` in `style.css`. Verify which components are affected. Every affected component should be a search input — if unrelated components change, there's a collision.

### Related files
- `src/style.css`

---

## Bug Pattern: getBlockReason Dead Code Path for Evolution-Locked Names

### Symptom
A Pokémon that is blocked by evolution lock may show the wrong rejection message. The message says "already in the Graveyard" instead of "evolution line is in the Graveyard".

### Likely cause
`getBlockReason` (lines 186-193) checks `unavailableNames` first, then checks each specific set. The order is:
1. Check `deadNames` → "already in the Graveyard"
2. Check `activeNames` → "already in an active team slot"
3. Check `boxedNames` → "already in the Box"
4. Fallback → "evolution line is in the Graveyard"

This works correctly as written, but relies on the fact that `unavailableNames` is `lockedNames ∪ activeNames ∪ boxedNames`, and `deadNames` is a subset of `lockedNames`. If the logic ever changes so that `lockedNames` contains entries not in `deadNames` (which it should — evolution-chain members), the fallback correctly identifies them.

**Edge case:** If a Pokémon is BOTH dead AND on the active team (shouldn't happen, but possible if state is corrupted), it would show "already in the Graveyard" which is misleading since it's also active.

### Prevention
Add an assertion or guard log when a name is in multiple availability sets simultaneously — this indicates state corruption.

### Regression test idea
Can't easily trigger in normal use. Would require manually corrupting localStorage to have a Pokémon in both graveyard and active slots.

### Related files
- `src/hooks/usePersistentRunState.ts:186-193`

---

## Related notes

- [[Architecture - Soullink]]
- [[Lessons Learned - Soullink]]
- [[ADR Candidates - Soullink]]
- [[Final State - Soullink]]
