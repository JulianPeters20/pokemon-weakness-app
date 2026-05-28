# ADR Candidates - Soullink

---

## ADR Candidate: React + Vite + TypeScript as Frontend Stack

### Status
Accepted (implicit — visible from `package.json` and project scaffold)

### Context
The app needed a modern web framework to build an interactive Pokémon team tracker with real-time search, async data fetching, and responsive layout.

### Decision
React 19 with TypeScript 6, bundled with Vite 8.

### Reasons
- React is the most widely used component framework with a large ecosystem.
- TypeScript provides type safety for the complex data model (Pokémon types, stats, evolution chains, encounter locations).
- Vite offers fast HMR during development and produces optimized static builds.
- No framework-specific server or routing needed — single-page app.

### Alternatives
- Vue + Vite — comparable developer experience but less ecosystem for this domain.
- Svelte — smaller bundle but less familiarity.
- Plain JavaScript + Vanilla DOM — feasible but harder to maintain for 16+ components.

### Consequences
- Requires Node.js for development (npm run dev / build).
- Static site output can be deployed anywhere (Vercel, Netlify, GitHub Pages).
- TypeScript strict mode (`noUnusedLocals`, `verbatimModuleSyntax`) enforces clean code.

### Related files
- `package.json`
- `tsconfig.json`
- `src/main.tsx`

### Should become permanent ADR?
Yes — this is a foundational choice unlikely to change.

---

## ADR Candidate: PokéAPI Runtime Fetch vs Local Pokémon Data

### Status
Accepted (implicit — visible from `src/api.ts`)

### Context
Pokémon data (stats, types, sprites, moves, species info, type chart) must come from somewhere. Options: fetch live from PokéAPI, or bundle all 809 Gen 1–7 Pokémon data at build time.

### Decision
Fetch Pokémon data at runtime from PokéAPI. Only the Pokémon name list is cached in memory.

### Reasons
- Bundle size: preloading all 809+ Pokémon with sprites, stats, types, and moves would bloat the bundle to tens of MB.
- Freshness: PokéAPI may update or fix data without requiring a redeploy.
- Simplicity: no build-time data generation pipeline needed for the core Pokémon data.

### Alternatives
- Preload all data at build time — eliminates internet dependency but massively increases bundle size.
- Preload only Gen 1 data and fetch others on demand — mixed approach, adds complexity.

### Consequences
- Internet connection required for initial Pokémon selection (name list cached after first fetch, but stats/types always fetched live).
- Loading spinners needed per slot while data arrives.
- If PokéAPI is slow or down, the app becomes unusable for selection.

### Related files
- `src/api.ts`
- `src/hooks/useSlotPokemon.ts`
- `src/hooks/usePersistentRunState.ts`

### Should become permanent ADR?
Yes — the runtime fetch strategy is a core architectural invariant.

---

## ADR Candidate: No Backend / No Accounts

### Status
Accepted (implicit — no server code exists in the repository)

### Context
The app tracks user progress across a Soul Link Nuzlocke run. This could be stored on a server with accounts, or entirely client-side.

### Decision
No backend. All state is client-side, persisted to localStorage. No accounts, no authentication, no server-side API.

### Reasons
- PokéAPI is free and public — no need for an API key or proxy.
- User data (team, graveyard, encounters) is small enough for localStorage (~5–10 MB limit).
- A backend adds deployment complexity, maintenance burden, and privacy concerns.
- The app is a companion tool, not a multiplayer game server.

### Alternatives
- Firebase / Supabase — would enable cross-device sync but adds auth and vendor dependency.
- Custom Node.js backend — full control but requires server deployment and database.
- IndexedDB — larger storage than localStorage but more complex API.

### Consequences
- Data is tied to one browser on one device. Clearing browser storage loses all progress.
- No cross-device or cross-player sync without exporting/importing JSON files.
- Versioning and migration must be handled in the export/import layer.

### Related files
- `src/utils/storage.ts`
- `src/utils/exportImport.ts`

### Should become permanent ADR?
Yes — the no-backend constraint is a project requirement, not a temporary decision.

---

## ADR Candidate: Single State Hook vs Multiple Stores

### Status
Accepted (implicit — one 476-line hook in `src/hooks/usePersistentRunState.ts`)

### Context
The app manages several domains of state: active team slots, graveyards, box pairs, encounter filter settings, and used location tracking. These could be separate hooks/stores or combined.

### Decision
All mutable run state lives in one `usePersistentRunState` hook. Derived Sets (`deadNames`, `activeNames`, etc.) are computed from source state and passed as props.

### Reasons
- Cross-cutting concerns (evolution lock, availability checks) need data from multiple domains — a single hook keeps them consistent.
- Fewer prop layers needed than with separate stores (no context API needed).
- A single `useEffect` with `JSON.stringify` dependency handles persistence cleanly.

### Alternatives
- Separate hooks per domain (`useGraveyard`, `useEncounterState`, etc.) + React Context for shared data.
- Zustand or Jotai external state library.
- useReducer with a global action dispatch.

### Consequences
- The hook is 476 lines and growing. Beyond ~600 lines it should be split.
- Adding a new feature means touching the central hook, increasing merge conflict risk.
- Testing is harder because the hook orchestrates side effects, not just state.

### Related files
- `src/hooks/usePersistentRunState.ts`

### Should become permanent ADR?
Maybe — acceptable now but should be revisited when the hook exceeds 600 lines or when a 4th or 5th domain is added.

---

## ADR Candidate: localStorage as Persistence Layer

### Status
Accepted (implicit — `src/utils/storage.ts` wraps localStorage)

### Context
Run state must survive page refreshes. Options: localStorage, IndexedDB, SessionStorage, or a backend.

### Decision
localStorage with JSON serialization. Automatic save on every state change via `useEffect`.

### Reasons
- Simplest API (`getItem`/`setItem`), synchronous, no async boilerplate.
- ~5–10 MB is enough for the current data (6 slots × cached Pokémon + graveyard + box + encounter state).
- No manual save button needed — the effect fires automatically.

### Alternatives
- IndexedDB — more storage, structured queries, but async API is harder to work with for small data.
- SessionStorage — lost when the tab closes, not suitable.
- Backend — see "No Backend / No Accounts" ADR.

### Consequences
- Users who clear browser storage lose their run.
- No cross-device sharing without export/import.
- `QuotaExceededError` is not handled — if storage fills up, saves silently fail.
- Synchronous `setItem` blocks the main thread during serialization of large state.

### Related files
- `src/utils/storage.ts`
- `src/utils/exportImport.ts`

### Should become permanent ADR?
Yes — localStorage is the right persistence layer for a single-device companion tool at this scale.

---

## ADR Candidate: Single CSS File vs CSS Modules / CSS-in-JS

### Status
Accepted (implicit — `src/style.css` is the only stylesheet)

### Context
Styling could use CSS Modules, Tailwind, styled-components, Emotion, or a single global CSS file.

### Decision
Single `style.css` file (~1919 lines) with CSS custom properties for theming and CSS Grid for layout.

### Reasons
- No extra dependencies — keeps the bundle small and build fast.
- Dark theme is simple enough (10–15 custom properties) that CSS-in-JS offers no advantage.
- CSS Grid with named areas elegantly handles the responsive 3-column layout.
- Single file is easy to navigate for a 16-component project.

### Alternatives
- Tailwind CSS — would increase HTML size, requires configuration, adds a build step.
- CSS Modules — scoped by default but adds import overhead for each component.
- styled-components — runtime CSS-in-JS with bundle cost and React-specific lock-in.

### Consequences
- Global namespace: class name collisions are possible (e.g., `.search-input` used in multiple contexts).
- No component-level dead style elimination — unused styles remain in the bundle.
- CSS file grows linearly with features; at ~3000 lines it would benefit from splitting.

### Related files
- `src/style.css`

### Should become permanent ADR?
Maybe — adequate for the current project size but should be revisited if the CSS exceeds ~3000 lines or if class name collisions occur.

---

## ADR Candidate: Encounter Data as Local Static Files vs Runtime Scrape

### Status
Accepted (implicit — `src/data/unboundEncounters.ts` is a checked-in TypeScript file)

### Context
Encounter location data comes from the Pokémon Unbound Location Guide (a Google Sheets workbook). This data could be fetched/scraped at runtime or stored locally.

### Decision
The encounter data is manually extracted and stored as a local TypeScript file (`src/data/unboundEncounters.ts`) with a structured schema.

### Reasons
- No runtime dependency on Google Sheets or external scraping — the app works offline for the encounter tracker.
- The data is static (it changes only when the game itself updates).
- Typed data ensures compile-time validation of encounter structure.
- Easy to update by editing one file.

### Alternatives
- Scrape Google Sheets at runtime — fragile, requires CORS handling or a proxy, fails without internet.
- Store as JSON and fetch at runtime — works but adds an extra network request.

### Consequences
- The encounter data is a snapshot in time. If the Location Guide is updated, the file must be manually updated.
- The extraction process is manual (copy from workbook, format as TypeScript).
- **Unclear:** The workbook data may have omissions or errors — no automated validation exists.

### Related files
- `src/data/unboundEncounters.ts`
- `src/encounterFilter.ts`

### Should become permanent ADR?
Yes — for a static-game companion, local data files are the right choice.

---

## ADR Candidate: Learnset Data from Decompiled ROM vs PokéAPI Only

### Status
Accepted (implicit — `scripts/convertLearnsets.cjs` + `src/data/generated/unboundLearnsets.ts`)

### Context
Level-up move data for Pokémon Unbound could come from PokéAPI (official game data) or from the actual Pokémon Unbound ROM. Official data may not match Unbound's custom learnsets.

### Decision
Use decompiled Pokémon Unbound ROM data (`scripts/data/Learnsets.c`) converted to TypeScript via a Node script. Fall back to PokéAPI data when Unbound data is unavailable.

### Reasons
- Pokémon Unbound changes learnsets from official games. Using the ROM data gives more accurate results.
- The conversion script can be re-run if the source data is updated.
- The fallback mechanism (label showing "Reference data" vs "Pokémon Unbound learnset") is honest about data provenance.

### Alternatives
- PokéAPI only — simpler but potentially inaccurate for Unbound.
- Manual learnset entry — not scalable for 809+ Pokémon.
- Scrape in-game at runtime — technically complex and slow.

### Consequences
- The conversion script parses C structs with regex `scripts/convertLearnsets.cjs` — fragile if the decompiled format changes.
- The generated file is very large (`src/data/generated/unboundLearnsets.ts`, ~22k lines), increasing bundle size.
- Some Pokémon may lack Unbound learnset data if name mapping fails between the ROM and PokéAPI naming conventions.

### Related files
- `scripts/convertLearnsets.cjs`
- `scripts/data/Learnsets.c`
- `src/data/generated/unboundLearnsets.ts`
- `src/utils/unboundLearnsets.ts`
- `src/utils/levelUpMoves.ts`

### Should become permanent ADR?
Yes — the ROM data approach is a key differentiator that makes the app more accurate for its target game.

---

## ADR Candidate: Single-Page App (No Routing)

### Status
Accepted (implicit — single `index.html`, no router dependency)

### Context
The app displays multiple sections: Soul Link dashboard, graveyard, box, encounter tracker, battle helper. These could be separate pages/routes or stacked on one page.

### Decision
Single page with all sections stacked vertically. No React Router or URL routing.

### Reasons
- Users need to see multiple sections simultaneously (e.g., team dashboard next to graveyard).
- The app has only 5 main sections — not enough to justify route-based navigation.
- No routing means no router dependency, no URL state management, simpler bundle.

### Alternatives
- Multiple routes (`/dashboard`, `/encounters`, `/lookup`) — adds complexity without clear benefit.
- Tabs/accordions within a single page — could be added later without changing the architecture.

### Consequences
- All content is loaded on first paint — slower initial load but faster subsequent navigation.
- Scroll position is lost on refresh (acceptable for a companion tool).
- Future sections (e.g., settings page) would need to be added to the stack or switch to tabs.

### Related files
- `src/App.tsx` — single scrollable layout
- `index.html`

### Should become permanent ADR?
Yes — single-page with vertical stacking matches the usage pattern of a real-time companion tool.

---

## ADR Candidate: Evolution Chain Locking via PokéAPI vs Hardcoded Map

### Status
Accepted (implicit — `src/utils/evolutionLock.ts`)

### Context
Evolution-line locking requires knowing which Pokémon belong to which evolution chain. This data could be hardcoded as a map or fetched from PokéAPI.

### Decision
Fetch evolution chain data from PokéAPI (`/evolution-chain/{id}`) at runtime, cache in a module-level `Map<string, Set<string>>`.

### Reasons
- Avoids maintaining a hardcoded map of all ~270 evolution chains.
- PokéAPI data is authoritative for standard Pokémon games.
- In-memory caching avoids repeated fetches for the same species.

### Alternatives
- Hardcoded TypeScript map — no API dependency, but error-prone to maintain and large (~2000+ lines).
- Local generated file (like the learnset data) — possible but adds build step complexity.

### Consequences
- Module-level cache is lost on page refresh, requiring re-fetches.
- If PokéAPI is unavailable during a session, the lock cannot be computed (the current code falls back to permitting selection).
- **Assumption:** PokéAPI evolution chain data includes all variant forms needed for Pokémon Unbound.

### Related files
- `src/utils/evolutionLock.ts`
- `src/hooks/usePersistentRunState.ts` — where `unavailableNames` is computed

### Should become permanent ADR?
No — this should be revisited. A local generated evolution map (from the same build process) would eliminate the API dependency and work offline, matching the app's overall offline-friendly design.

---

## ADR Candidate: 3-Column Dashboard Layout

### Status
Accepted (implicit — `src/style.css` grid definitions)

### Context
The core dashboard shows Player 1 Graveyard, 6 Soul Link slots, and Player 2 Graveyard. These could be laid out in various ways.

### Decision
CSS Grid with `grid-template-areas` defining a 3-column layout: `g1 slots g2`. Collapses to stacked on screens < 1024px.

### Reasons
- Graveyards remain visible alongside the team at all times on desktop.
- The visual symmetry (P1 left, P2 right) reinforces the two-player concept.
- CSS Grid with named areas makes the layout intent clear in the stylesheet.
- Responsive collapse to stacked layout works well on mobile.

### Alternatives
- Flexbox with wrapping — less control over the exact 3-column arrangement.
- CSS columns — not suitable for non-text content.
- Sidebar layout (graveyards in a left drawer) — hides the graveyards behind interaction.

### Consequences
- Three columns mean less horizontal space for each section on medium screens.
- The grid definition is tied to a specific DOM structure — reordering sections requires CSS changes.

### Related files
- `src/style.css` (lines ~976–1000, `.dashboard-area` grid)
- `src/App.tsx` (dashboard container DOM structure)

### Should become permanent ADR?
Yes — the graveyard-flanking-slots layout is visually distinctive and well-matched to the app's purpose.

---

## Related notes

- [[Architecture - Soullink]]
- [[Features - Soullink]]
- [[Tech Stack - Soullink]]
- [[Lessons Learned - Soullink]]
