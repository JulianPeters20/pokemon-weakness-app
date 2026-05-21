import { fetchPokemon, fetchPokemonSpecies, fetchTypeData } from "../api.ts"
import { combineDamageRelations, calculateWeaknesses } from "../weakness.ts"
import { getGenerationFromId, isSupportedGeneration, isMega, extractGeneration } from "../generation.ts"
import type { SlotEntry } from "../types.ts"

export async function fetchSlotEntry(name: string): Promise<SlotEntry> {
  const trimmed = name.toLowerCase().trim()

  if (isMega(trimmed)) {
    return {
      pokemon: null,
      weaknesses: [],
      generation: "",
      isLoading: false,
      error: "Mega Pokémon are not supported in Pokémon Unbound.",
    }
  }

  try {
    const data = await fetchPokemon(trimmed)

    const speciesUrlParts = data.species.url.replace(/\/$/, "").split("/")
    const speciesId = Number(speciesUrlParts[speciesUrlParts.length - 1])
    const gen = getGenerationFromId(speciesId)

    if (!isSupportedGeneration(gen)) {
      const genLabel = gen ? `Generation ${gen}` : "an unknown generation"
      return {
        pokemon: null,
        weaknesses: [],
        generation: "",
        isLoading: false,
        error: `"${data.name}" is from ${genLabel}, which is not supported in Pokémon Unbound. Only Generations 1\u20137 are available.`,
      }
    }

    const [species, ...typeDatas] = await Promise.all([
      fetchPokemonSpecies(speciesId).catch(() => null),
      ...data.types.map((t) => fetchTypeData(t.type.name)),
    ])

    const multipliers = combineDamageRelations(
      typeDatas.map((td) => td.damage_relations),
    )

    return {
      pokemon: data,
      weaknesses: calculateWeaknesses(multipliers),
      generation: species ? extractGeneration(species.generation.url) : "Unknown",
      isLoading: false,
      error: "",
    }
  } catch (err) {
    const message =
      err instanceof TypeError
        ? "Network error \u2014 unable to reach Pok\u00E9API. Please check your internet connection."
        : err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
    return {
      pokemon: null,
      weaknesses: [],
      generation: "",
      isLoading: false,
      error: message,
    }
  }
}
