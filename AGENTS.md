# AGENTS.md

## Project goal

Build a polished Pokémon lookup app where users can search any Pokémon from all generations and see:
- type weaknesses and immunities
- base stats: HP, Attack, Defense, Special Attack, Special Defense, Speed
- Pokémon name, sprite/artwork, types, and generation if available

The app must be visually appealing, responsive, and easy to use.

## Data source

Use PokéAPI as the source of truth unless the repository already contains a complete local Pokémon dataset.

Required API data:
- `/api/v2/pokemon/{name-or-id}` for stats, types, sprites, and forms
- `/api/v2/type/{type}` for type damage relations
- `/api/v2/pokemon-species/{name-or-id}` for generation/species metadata if needed

Do not hardcode incomplete Pokémon lists or type charts unless they are generated from a verified complete source.

When calculating weaknesses:
- combine all Pokémon types
- multiply damage factors across dual types
- show 4x, 2x, 0.5x, 0.25x, and 0x where applicable
- include immunities as 0x
- avoid duplicate type entries

## Expected UX

The main screen should include:
- prominent Pokémon search input with helpful search feedback
- loading and error states
- clear card layout for Pokémon details
- type badges
- weakness/resistance grouping by multiplier
- stat display with labels and visual bars
- mobile-friendly responsive layout

Handle invalid names gracefully and suggest that the user check spelling.

## Implementation rules

Use React, Vite, and TypeScript.

Keep data-fetching logic separate from UI components:
- API client
- Pokémon/type calculation utilities
- UI components
- tests where practical

Normalize Pokémon names before lookup:
- trim whitespace
- lowercase input
- support common hyphenated names where possible

Avoid storing API secrets; PokéAPI does not require an API key.

Do not introduce unnecessary frameworks, state managers, or UI libraries.

## Quality expectations

Before finishing, run:
- `npm run build`
- `npm run lint` if configured
- tests if a test setup exists

If scripts or setup steps are added, document them in `README.md`.

Do not claim all generations are supported unless the implementation uses PokéAPI or another complete, current source.

## First task

Build the first complete version of the Pokémon lookup app.

Requirements:
- searchable Pokémon input
- fetch full Pokémon data from PokéAPI
- display name, image, types, generation, and base stats
- calculate weaknesses/resistances/immunities from type damage relations
- create a polished responsive UI
- include loading, empty, and error states
- keep code modular and readable
- add tests for weakness calculation if a test setup exists
- update README with setup and run instructions