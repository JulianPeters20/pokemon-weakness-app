import type { Pokemon, TypeData, PokemonSpecies } from "./types.ts"

const BASE_URL = "https://pokeapi.co/api/v2"

let pokemonListCache: { name: string; url: string }[] | null = null

export async function fetchAllPokemonNames(): Promise<{ name: string; url: string }[]> {
  if (pokemonListCache) return pokemonListCache
  const res = await fetch(`${BASE_URL}/pokemon?limit=100000&offset=0`)
  if (!res.ok) {
    throw new Error("Failed to fetch Pokémon list from PokéAPI")
  }
  const data = await res.json() as { results: { name: string; url: string }[] }
  pokemonListCache = data.results
  return pokemonListCache!
}

export async function fetchPokemon(nameOrId: string): Promise<Pokemon> {
  const query = nameOrId.toLowerCase().trim()
  const res = await fetch(`${BASE_URL}/pokemon/${encodeURIComponent(query)}`)
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`"${nameOrId}" is not a known Pokémon. Check the spelling and try again.`)
    }
    throw new Error(`PokéAPI returned an error (${res.status}). Please try again later.`)
  }
  return res.json()
}

export async function fetchPokemonSpecies(id: number): Promise<PokemonSpecies> {
  const res = await fetch(`${BASE_URL}/pokemon-species/${id}`)
  if (!res.ok) {
    throw new Error("Failed to fetch species data from PokéAPI")
  }
  return res.json()
}

export async function fetchTypeData(typeName: string): Promise<TypeData> {
  const res = await fetch(`${BASE_URL}/type/${typeName}`)
  if (!res.ok) {
    throw new Error("Failed to fetch type data from PokéAPI")
  }
  return res.json()
}
