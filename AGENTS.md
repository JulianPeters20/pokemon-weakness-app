# AGENTS.md

## Project goal

Build a polished Soul Link Nuzlocke companion website for two players playing the fanmade game Pokémon Unbound.

The app should help two players manage their linked Pokémon team during gameplay.

Core goals:
- provide exactly 6 Soul Link team slots
- each slot represents one linked Pokémon pair
- each slot supports one Pokémon for Player 1 and one Pokémon for Player 2
- Pokémon selection is limited to generations 1–7
- Mega Pokémon are not required and should not be selectable as base Pokémon
- selected Pokémon should show useful battle information:
  - name
  - sprite or artwork
  - types
  - type weaknesses and immunities
  - base stats: HP, Attack, Defense, Special Attack, Special Defense, Speed
  - level-up moves and calculated current moveset if implemented

The app must be visually appealing, responsive, and easy to use during an active Soul Link session.

## Product scope

The main UI should be a Soul Link dashboard, not a single Pokémon lookup page.

Required initial UI:
- page title and short explanation for a Pokémon Unbound Soul Link challenge
- exactly 6 Soul Link slots
- each slot has a clear slot number
- each slot has a Player 1 Pokémon selector
- each slot has a Player 2 Pokémon selector
- each empty Pokémon area has a clear placeholder state
- selected Pokémon are displayed as polished cards
- it must be obvious which two Pokémon are linked together

Useful Soul Link features to design for:
- route or encounter location per slot
- fainted/dead status per Pokémon or pair
- notes per linked pair
- optional warnings for duplicate types or broken challenge rules

Do not implement every advanced feature at once unless explicitly requested. Prefer a clean, extensible dashboard first.

## Data source

Use PokéAPI as the source of truth unless the repository contains a verified complete local Pokémon Unbound dataset.

Required API data:
- `/api/v2/pokemon/{name-or-id}` for stats, types, sprites, forms, and move data
- `/api/v2/type/{type}` for type damage relations
- `/api/v2/pokemon-species/{name-or-id}` for species and generation metadata

PokéAPI does not guarantee exact Pokémon Unbound move data. Do not claim move data is Pokémon Unbound-exact unless a verified local Pokémon Unbound dataset is added.

Do not hardcode incomplete Pokémon lists, type charts, or learnsets unless they are generated from a verified complete source.

## Pokémon availability rules

Only Pokémon introduced in generations 1–7 are supported.

Generation filtering rules:
- use species generation metadata where possible
- exclude Pokémon introduced in generation 8 or later
- autocomplete suggestions must only include supported Pokémon
- direct searches for unsupported Pokémon must show a clear message
- unsupported Pokémon must not leave empty cards, broken states, or broken routes

Mega Pokémon:
- do not include Mega Pokémon as selectable base Pokémon
- do not add Mega-specific logic unless explicitly requested later

Forms:
- regional forms may be supported if PokéAPI provides stable data and the existing app handles them safely
- form-specific stats and types must come from the actual Pokémon form endpoint
- species and generation data should be derived from the Pokémon response species URL/name, not by blindly reusing the form name

## Type effectiveness rules

When calculating weaknesses:
- use the selected Pokémon's actual current types
- combine all Pokémon types
- multiply damage factors across dual types
- show 4x, 2x, 0.5x, 0.25x, and 0x where applicable
- include immunities as 0x
- avoid duplicate type entries
- do not use base species types for regional forms or variants

## Move calculation rules

The app may show level-based move information for selected Pokémon.

For level-up move calculation:
- consider only level-up moves
- exclude TM, HM, tutor, egg, machine, and evolution moves unless explicitly requested later
- include moves learned at or before the selected level
- valid levels are 1–100
- sort eligible moves by learned level ascending
- use deterministic ordering for moves learned at the same level
- the calculated current moveset is the last four eligible level-up moves
- show all eligible level-up moves if the UI includes a move list
- clearly highlight the calculated current four-move moveset
- handle missing move data with a clear empty state

If multiple official version-group entries exist, prefer the latest available version group from generation 7 or earlier unless a verified Pokémon Unbound dataset exists.

## Expected UX

The app should be usable during gameplay without confusion.

UX requirements:
- polished responsive layout for desktop and mobile
- clear two-player layout
- visually separated Soul Link slot cards
- clear empty, loading, selected, and error states
- searchable Pokémon inputs with suggestions after at least 2 typed characters
- helpful feedback for invalid or unsupported Pokémon
- no empty sections, broken cards, or unclear placeholder text
- selected Pokémon cards should be compact but informative
- type badges should be easy to scan
- stats should be readable and preferably visualized with bars
- weaknesses and immunities should be grouped clearly by multiplier

Error handling must distinguish between:
- invalid Pokémon names
- unsupported Pokémon because of generation/filtering rules
- failed network requests
- PokéAPI unavailable or non-OK responses
- unexpected application errors

## Implementation rules

Use React, Vite, and TypeScript.

Keep logic modular:
- API/client logic separate from UI components
- Pokémon search and autocomplete logic separate from display components
- generation filtering separate from UI components
- type effectiveness calculation separate from UI components
- move calculation separate from UI components
- reusable UI components for repeated dashboard elements

Recommended component boundaries:
- Soul Link dashboard
- Soul Link slot
- Pokémon selector/search
- selected Pokémon card
- empty Pokémon placeholder
- type badge display
- stat display
- weakness display
- move display if implemented

Avoid unnecessary complexity:
- do not introduce new frameworks, state managers, UI libraries, or backend services unless explicitly requested
- do not rewrite unrelated working code
- do not remove existing working API/stat/type/weakness logic unless replacing it with equivalent or better modular logic
- keep changes small enough to review
- prefer readable code over clever abstractions

Normalize Pokémon names before lookup:
- trim whitespace
- lowercase input
- support common hyphenated names where possible

PokéAPI does not require an API key. Do not add secrets or environment variables for PokéAPI.

## State and persistence

Use local component state unless persistence is explicitly requested.

If persistence is added later:
- prefer browser localStorage for simple team persistence
- keep persistence logic isolated
- never require accounts, authentication, or a backend unless explicitly requested

## Testing expectations

Add or update tests when a test setup exists.

High-value test targets:
- generation 1–7 filtering
- exclusion of generation 8+ Pokémon
- Mega Pokémon exclusion
- type effectiveness calculation
- regional form handling
- level-up move filtering
- current four-move moveset calculation
- edge cases: level 1, level 100, invalid levels, no move data, missing API fields

Do not add a large test framework only for one small change unless explicitly requested.

## Quality expectations

Before finishing any implementation task:
- run `npm run build`
- run `npm run lint` if configured
- run tests if a test setup exists
- update `README.md` if setup, commands, deployment, or major app behavior changed

Do not claim a feature is complete unless it was implemented and verified.

Do not claim Pokémon Unbound-exact data unless a verified Pokémon Unbound dataset exists in the repository.

## Current main task

Restructure the existing Pokémon lookup app into a Soul Link dashboard for Pokémon Unbound.

Initial implementation scope:
- preserve useful existing Pokémon API, stats, type, and weakness logic
- build the main UI around exactly 6 Soul Link slots
- each slot supports selecting Pokémon for Player 1 and Player 2
- selection is limited to generations 1–7
- Mega Pokémon are excluded from selectable Pokémon
- selected Pokémon cards show name, sprite/artwork, types, base stats, and weaknesses
- empty slots look intentional and polished
- errors and unsupported Pokémon are handled clearly
- keep the code modular and maintainable
- run `npm run build` before finishing