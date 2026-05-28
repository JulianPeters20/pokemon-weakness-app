# Tech Stack

## Core

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.6 | UI framework |
| TypeScript | ~6.0.2 | Type safety |
| Vite | 8.0.12 | Bundler & dev server |

## Dependencies

Only 4 production dependencies (all in `package.json`):

```
react, react-dom, @types/react, @types/react-dom, typescript, vite
```

**No external UI libraries, no state management libraries, no CSS frameworks, no backend.**

## Data Sources

| Source | Type | Used For | File |
|---|---|---|---|
| PokéAPI (REST) | Runtime fetch | Pokémon stats, types, sprites, moves, species, evolution chains, type chart | `src/api.ts` |
| Pokémon Unbound Location Guide workbook | Local static data | Encounter locations, methods, requirements | `src/data/unboundEncounters.ts` |
| Pokémon Unbound decompiled ROM (Learnsets.c) | Local generated data | Level-up move learnsets | `src/data/generated/unboundLearnsets.ts` |

## Build Pipeline

```
npm run dev       →  Vite dev server with HMR
npm run build     →  tsc && vite build (type-check then bundle)
npm run preview   →  Vite preview of built output

npm run generate-learnsets →  converts scripts/data/Learnsets.c → src/data/generated/unboundLearnsets.ts
```

## Deployment

- Built as a static site (`dist/` after `npm run build`)
- Deployed to Vercel

## TypeScript Configuration (tsconfig.json)

- Target: ES2023
- JSX: `react-jsx`
- Module resolution: `bundler`
- Strict flags: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`
- Only includes `src/`

## CSS

- Single file: `src/style.css` (~1919 lines)
- Dark theme through CSS custom properties
- CSS Grid for layout
- No CSS-in-JS, no modules, no preprocessors

## Key Design Decisions

1. **No runtime routing** — single page, no React Router needed
2. **No external state management** — single custom hook (`usePersistentRunState`) suffices
3. **No async state library** — plain useState + useEffect for fetch lifecycle
4. **All styles in one file** — simpler than CSS modules for this project size
5. **Static site** — no server, no API keys (PokéAPI is free and open)

## Related Notes

- [[Architecture]]
- [[ADR Candidates#ADR-003 CSS-Only Approach]]
- [[Features#Export / Import / Reset]]
