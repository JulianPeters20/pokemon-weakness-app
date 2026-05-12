import type { Pokemon, TypeData, PokemonSpecies } from "./types.ts"

const BASE_URL = "https://pokeapi.co/api/v2"

export async function fetchPokemon(nameOrId: string): Promise<Pokemon> {
  const res = await fetch(`${BASE_URL}/pokemon/${nameOrId.toLowerCase().trim()}`)
  if (!res.ok) {
    throw new Error(res.status === 404 ? "Pokémon not found" : "Failed to fetch Pokémon")
  }
  return res.json()
}

export async function fetchPokemonSpecies(id: number): Promise<PokemonSpecies> {
  const res = await fetch(`${BASE_URL}/pokemon-species/${id}`)
  if (!res.ok) {
    throw new Error("Failed to fetch species data")
  }
  return res.json()
}

export async function fetchTypeData(typeName: string): Promise<TypeData> {
  const res = await fetch(`${BASE_URL}/type/${typeName}`)
  if (!res.ok) {
    throw new Error("Failed to fetch type data")
  }
  return res.json()
}
