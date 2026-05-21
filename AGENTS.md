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

## Pokémon Unbound encounter tracking

The app should support encounter tracking for a Pokémon Unbound Soul Link Nuzlocke.

Use the uploaded Pokémon Unbound Location Guide workbook as the source for local encounter data when available.

Relevant source tabs:
- Grass & Cave Encounters
- Surfing, Fishing, Rock Smash
- Gift & Static Encounters
- LegendMythical & Ultra Beasts
- In-game trades & Game Corner
- Swarm Schedule

Do not use PokéAPI for Pokémon Unbound encounter locations. PokéAPI does not contain Pokémon Unbound-specific encounter tables.

Encounter tracking rules:
- store encounter data in local typed data files
- do not scrape Google Sheets or websites at runtime
- group encounters by location and method
- each location should be checkable as used/completed
- checked locations should be visually crossed out or clearly marked
- each encounter may have unlock requirements
- encounter visibility must update live based on the selected progress filters

Required progress filters:
- badge count
- postgame status
- rod level: none, old, good, super
- Surf availability
- Rock Smash availability
- underwater access
- ADM availability
- Devon Scope availability
- enabled encounter categories: grass/cave, surf, fishing, rock smash, static, gift, mission reward, legendary, trade, game corner, swarm
- completed missions where needed

Encounter requirements should be represented as typed metadata, not as unstructured UI-only text.

Dead Pokémon tracking rules:
- provide a dedicated Dead Pokémon / Graveyard section
- dead Pokémon should be addable through the existing Pokémon selector/search where practical
- dead Pokémon entries should show at least name, sprite, and type badges
- dead Pokémon entries should be removable

Because this is a tracker, user state should eventually persist in localStorage:
- active Soul Link slots
- dead Pokémon
- checked encounter locations
- progress filters

## Randomizer rules

This Soul Link challenge is played with a randomized Pokémon Unbound ROM.

Because the game is randomized:
- official Pokémon Unbound encounter tables are used only for locations, encounter methods, and unlock requirements
- do not treat listed encounter Pokémon as guaranteed or authoritative
- do not display encounter Pokémon as fixed expected encounters unless the UI clearly labels them as "vanilla/reference data"
- prioritize tracking whether a location has been used over showing exact vanilla encounter pools
- the user should be able to manually enter or select the actually encountered randomized Pokémon
- encounter checklist entries should focus on:
  - location
  - encounter method
  - unlock requirements
  - used/completed state
  - optional notes
  - optional actual encountered Pokémon entered by the user

The tracker should support randomized gameplay by letting users record the real randomized encounter they received at each location.

Encounter filtering should still apply because unlock conditions are not necessarily randomized:
- rods still unlock fishing encounters
- Surf still unlocks Surf encounters
- Rock Smash still unlocks Rock Smash encounters
- postgame-only encounters should remain hidden unless postgame is enabled
- static/gift/mission/trade/game-corner/swarm categories should be toggleable
- mission, item, weekday, daily, and weekly requirements should be represented as metadata where practical

When using the Pokémon Unbound Location Guide workbook:
- extract and store locations, methods, and requirements
- store vanilla Pokémon names only as optional reference information
- keep randomizer-specific user-entered encounter Pokémon separate from vanilla reference data

## Pokémon Lookup / Battle Helper

The app should include a standalone informational Pokémon Lookup / Battle Helper section at the bottom of the page.

This section is separate from the active Soul Link team, Graveyards, Box, and Encounter Tracker.

Lookup rules:
- users can search a Pokémon for information only
- lookup must not modify active team slots
- lookup must not modify Graveyards
- lookup must not modify Box / Reserve Pairs
- lookup must not modify encounter checklist state
- Graveyard, Box, and active-team restrictions do not block lookup
- global Pokémon availability still applies: generations 1–7 only, no Mega Pokémon

The lookup result should show:
- name
- sprite/artwork
- types
- base stats
- weaknesses, resistances, and immunities
- optional level-based current moveset

Level-based moveset rules:
- allow entering a level from 1–100
- calculate the current moveset as the last four level-up moves learned at or before that level
- use only `level-up` move learn methods
- exclude TM, HM, tutor, egg, machine, and evolution moves
- handle missing move data with a clear empty state
- PokéAPI move data is official reference data and may not match Pokémon Unbound or randomized move settings exactly
- label or document move data as reference data

## Evolution-line lock rules

Standard Nuzlocke death logic should lock an entire evolution line, not only the exact Pokémon form that died.

If any Pokémon is in either player's Graveyard:
- all Pokémon in that Pokémon's evolution line become unavailable everywhere
- this applies globally to both players
- this applies to active team selection and Graveyard search
- only the actual dead Pokémon should be added to the Graveyard, not every evolution stage

Examples:
- Charmander in Graveyard locks Charmander, Charmeleon, and Charizard
- Charizard in Graveyard locks Charmander, Charmeleon, and Charizard
- Bulbasaur in Graveyard locks Bulbasaur, Ivysaur, and Venusaur
- Eevee in Graveyard locks Eevee and all Eeveelutions

Removing a Pokémon from Graveyard unlocks its evolution line again unless another member of that same evolution line is still in either Graveyard.

Evolution-line data should come from PokéAPI species/evolution-chain data or a verified local dataset. Keep this logic separate from UI components and cache lookups where practical.

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