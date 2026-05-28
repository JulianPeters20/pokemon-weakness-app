# Rules Candidates - Soullink

---

## Project rules

Rules specific to the Soullink app and its data model.

- Rule: Never treat encounter data as authoritative for Pokémon availability.
  Reason: The ROM is randomized, so `src/data/unboundEncounters.ts` is reference only. Using it to block or assert Pokémon selection would break the app's randomizer-aware design.
  Example: `encounterFilter.ts` filters location visibility but must never feed into `lockedNames`, `deadNames`, or any team/Graveyard/Box logic.

- Rule: Normalize all Pokémon names with `.toLowerCase().trim()` before any lookup, comparison, or set membership check.
  Reason: PokéAPI returns lowercase names, user input may have mixed case or spaces, and availability sets (`deadNames`, `activeNames`, etc.) use normalized keys. Inconsistent normalization causes false negatives in blocking logic.
  Example: `handleSelectPokemon` normalizes before checking `getBlockReason`. `handleAddGraveyard` normalizes before checking duplicates.

- Rule: Every SlotEntry must handle four distinct UI states: empty, loading, loaded, and error.
  Reason: Components like `CompactPokemonCard`, `SoulLinkSlot`, and `GraveyardPanel` all consume `SlotEntry` objects. Missing any state causes broken UI (e.g., infinite spinner, blank card, unhelpful error).
  Example: `SoulLinkSlot.tsx` renders different JSX for `isLoading`, `pokemon` truthy, and `error` truthy. Never skip one of these branches.

- Rule: Encounter locations with multiple methods must be evaluated per-method, not per-location.
  Reason: A location supporting both `grass-cave` and `surf` should show as available if either method is unlocked. Using only `methods[0]` for the key (as currently done in `EncounterTracker.tsx`) can incorrectly hide locations.
  Example: Route with `["grass-cave", "surf"]` should appear when surf is toggled on even if grass-cave is toggled off.

- Rule: The `SoulLinkTeam` type is a fixed-length tuple of 6 slots — never add or remove slots.
  Reason: The Soul Link challenge has exactly 6 pairs. The tuple type enforces this at compile time. Array methods like `.push()` or `.filter()` that change length would break the type.
  Example: `createEmptyTeam()` uses `Array.from({ length: 6 })` and casts to `SoulLinkTeam`. New slot operations must preserve exactly 6 entries.

---

## Coding rules

Rules for modifying the code safely.

- Rule: Run `npm run build` before declaring any task complete.
  Reason: TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`) catches unused imports, incorrect types, and syntax errors that would ship to production.
  Example: After adding a new component, run `npm run build`. If it fails on an unused import, remove it before committing.

- Rule: Do not add new dependencies without written justification in the PR or commit message.
  Reason: The project has only 4 production deps (React, React-DOM + their types). Adding a state manager, UI kit, or utility library increases bundle size, build complexity, and maintenance burden.
  Example: "I want to add Lodash" → Justification: "The project uses `.filter().map()` chains in 3 places; a single `_.pipe()` would not justify 24KB of minified JS."

- Rule: Prefer local static data over PokéAPI API calls when the data is known at build time.
  Reason: The app works offline for encounter locations and learnsets because they are local files. PokéAPI should only be used for dynamic data (stats per Pokémon, types, sprites) that changes per selection.
  Example: `src/data/unboundEncounters.ts` is a local file. New encounter methods should be added there, not fetched from an external source at runtime.

- Rule: Pokémon name normalization must happen in a single shared utility, not inline.
  Reason: Currently done inline in `PokemonSearch.tsx`, `GraveyardPanel.tsx`, `PokemonLookupSection.tsx`, and `usePersistentRunState.ts`. If the normalization logic changes (e.g., handling special characters), every inline call site must be updated.
  Example: Extract a `normalizePokemonName(name: string): string` function into `src/utils/pokemon.ts` and use it everywhere instead of `.toLowerCase().trim()`.

- Rule: Every `PokemonSearch` instance must receive all four availability sets (`lockedNames`, `deadNames`, `activeNames`, `boxedNames`).
  Reason: The search component uses these to determine which Pokémon to block and what rejection message to show. Missing any set means some blocking rules are silently skipped.
  Example: `PokemonSearch` is used in 5 places (6 slots × 2 players, 2 graveyards, box editor). Each usage passes the same 4 sets from `usePersistentRunState`.

- Rule: When adding a new UI state (loading/empty/error), update all consuming components in the same change.
  Reason: Adding a new field to `SlotEntry` but not rendering it in `CompactPokemonCard` or `SoulLinkSlot` creates dead code and confusing UI states.
  Example: If `isLoading` is added to a new type, every component that renders that type must have a loading branch.

---

## Memory rules

Rules for updating Obsidian after coding sessions.

- Rule: After every coding session, create or update a session note in `docs/obsidian-export/` before committing.
  Reason: Session notes capture what was done, what problems were encountered, and what decisions were made. They are the primary way future agents understand the project's evolution.
  Example: `docs/obsidian-export/Session - OpenCode Final Build.md` documents the full build session with goal, steps, problems, learnings.

- Rule: When a new ADR-worthy decision is made during a session, add it to `docs/obsidian-export/ADR Candidates.md` within the same session note.
  Reason: Delaying ADR capture means the context (alternatives considered, trade-offs) is lost. Write it while the decision is fresh.
  Example: "We chose Route A over Route B because of X" → Add an ADR Candidate entry with Context, Decision, Reasons, Alternatives, Consequences.

- Rule: When a bug pattern is discovered during development, add it to `docs/obsidian-export/Bug Pattern Candidates.md` immediately.
  Reason: Bug patterns discovered during development are the most authentic. Waiting until after a bug ships loses the debugging context.
  Example: The `skip` variable race condition in `handleAddGraveyard` should be documented as a bug pattern as soon as it's identified, even if it's not currently triggered.

- Rule: Update `docs/obsidian-export/Project Overview.md` when the project scope changes (new feature category, new limitation, change in status).
  Reason: The Project Overview is the entry point for anyone (human or AI) approaching the project. Stale overview leads to wrong assumptions.
  Example: Adding PWA support changes the "Known limitations" and "Technical summary" sections.

---

## Testing rules

Rules for manual or automated checks after changes.

- Rule: After modifying any logic in `generation.ts`, `weakness.ts`, `encounterFilter.ts`, `evolutionLock.ts`, or `levelUpMoves.ts`, test with at least 3 representative inputs.
  Reason: These modules are pure-logic (no UI, no async) and edge cases are easy to miss. A few manual test cases catch most regressions.
  Example: After changing `generation.ts`, test with:
  - `"pikachu"` (Gen 1, should be allowed)
  - `"cinderace"` (Gen 8, should be blocked)
  - `"charizardmegax"` (Mega, should be blocked)
  - `"rattata-alola"` (regional form, should be allowed)

- Rule: After modifying any file in `src/hooks/`, manually test every component that uses the changed hook.
  Reason: The hooks are the state orchestration layer. A change to `usePersistentRunState` affects 5+ components. A change to `useSlotPokemon` affects slot fetching in 7+ places.
  Example: After changing `handleMarkSlotDead` in `usePersistentRunState.ts`, test:
  - Marking a slot dead → both Pokémon appear in graveyard
  - Evolution line members are removed from active slots and box
  - Undo is not possible (expected UX)

- Rule: After changing `src/utils/exportImport.ts`, test with a real export → clear → import cycle.
  Reason: Import/export is the only cross-session data recovery mechanism. A broken import silently loses user data.
  Example: Export a run with 3 filled slots, 2 graveyard entries, 1 box pair, some used locations. Clear localStorage. Refresh. Import the file. Verify all state matches.

- Rule: After any CSS change, check both the desktop (≥1024px) and mobile (<640px) layout.
  Reason: The app uses CSS Grid with responsive breakpoints at 1024px and 640px. A change that looks correct on desktop may break the mobile layout.
  Example: Adding a new section to the dashboard area must be tested at 3 widths: 1280px (3-column grid), 800px (graveyards stacked), 400px (single column).

---

## Agent behavior rules

Rules that OpenCode, Claude Code, or another agent should follow.

- Rule: Read `docs/obsidian-export/Agent Context.md` first when starting work on this project.
  Reason: Agent Context.md is the onboarding file — it lists key files, quick commands, constraints, and cross-references all other documentation notes. Skipping it wastes time.
  Example: Before fixing a bug, read Agent Context to find the relevant files, then check Bug Pattern Candidates to see if the bug is already documented.

- Rule: Never modify `src/` or `scripts/` files when the task is documentation-only.
  Reason: Documentation tasks should only touch `docs/` or root `.md` files. Accidental source changes introduce unnecessary risk and diff noise.
  Example: Creating this Obsidian export must not change any file under `src/` or `scripts/`.

- Rule: If a task description does not specify implementation details, first find an existing pattern in the codebase and follow it.
  Reason: The project has established conventions (component structure, state management, CSS class naming, async lifecycle). Following existing patterns reduces review time and consistency issues.
  Example: Adding a new filter toggle → follow the exact pattern of existing toggles in `ProgressFilters.tsx`, from the checkbox JSX to the `ProgressFilters` type field to the `encounterFilter.ts` logic.

- Rule: When the user asks "what should I do next?" after a completed task, propose concrete options not generic categories.
  Reason: Vague suggestions like "improve UI" or "add features" are not actionable. The agent should reference specific files, known limitations, or bug patterns.
  Example: "Based on the Bug Pattern Candidates, `handleMarkBoxPairDead` does not clean up active slots when a box pair is marked dead. I can fix that in `usePersistentRunState.ts`. Alternatively, I can add PWA support by creating a service worker."

- Rule: When encountering a type error or build failure, read the full error message before proposing a fix.
  Reason: TypeScript 6 strict mode errors are precise. The error message often includes the exact type mismatch with line numbers. Guessing the fix without reading the full message leads to trial-and-error cycles.
  Example: `error TS2322: Type 'string | undefined' is not assignable to type 'string'` → Read the line, find where undefined is possible, handle it.

- Rule: Before adding a new prompt to `Reusable Prompts.md`, verify it is not a duplicate of an existing prompt.
  Reason: The prompt library is meant to be curated, not exhaustive. Duplicate prompts create confusion about which one to use.
  Example: If `Reusable Prompts.md` already has "Add a feature safely", do not add another "Implement new feature" prompt — improve the existing one instead.

---

## Related notes

- [[Project Overview - Soullink]]
- [[Architecture - Soullink]]
- [[Agent Context - Soullink]]
- [[Lessons Learned - Soullink]]
- [[Bug Pattern Candidates - Soullink]]
- [[Reusable Prompts - Soullink]]
