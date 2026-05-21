# Pokémon Unbound Soul Link Companion

A Soul Link Nuzlocke companion website for two players playing Pokémon Unbound.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Vercel

```bash
npm run build
npx vercel --prod
```

The app is a static client-side React build. No server or database required.

## How it works

The dashboard provides exactly 6 Soul Link slots. Each slot represents one linked
Pokémon pair — one for Player 1 and one for Player 2.

Pokémon data is fetched from [PokéAPI](https://pokeapi.co/).

## Data Persistence

All run data (slots, graveyard, encounter progress, filters) is saved to
**browser localStorage**.

### Export / Import

You can Export your run to a JSON file and Import it on another device or browser.

- **Export** downloads a `.json` file of your current run state.
- **Import** reads a previously exported `.json` file and overwrites the current run.
- A confirmation prompt appears before importing to prevent accidental overwrites.
- Imported data is validated — invalid or malformed files show an error without modifying state.

Important notes when sharing a run with another player:
- Saved data is **browser-specific and device-specific**.
- Each player/browser has its own independent saved state.
- Refreshing the page keeps your data. Clearing browser data loses it.
- There is no cloud sync; use Export/Import to transfer state between devices.

## Limitations

- Encounter locations use Pokémon Unbound reference data from the official
  Location Guide workbook. Because the ROM is randomized, listed vanilla
  encounters are reference only.
- Level-up movesets are available in the Battle Helper section using official
  PokéAPI reference move data. This data may not match Pokémon Unbound or
  randomized move sets exactly.
- Mega Pokémon are not selectable.
- Only Generations 1–7 are supported.
