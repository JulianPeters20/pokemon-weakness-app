export interface PokemonType {
  slot: number
  type: {
    name: string
    url: string
  }
}

export interface PokemonStat {
  base_stat: number
  stat: {
    name: string
  }
}

export interface PokemonSprites {
  other: {
    "official-artwork": {
      front_default: string | null
    }
  }
}

export interface Pokemon {
  id: number
  name: string
  types: PokemonType[]
  stats: PokemonStat[]
  sprites: PokemonSprites
  height: number
  weight: number
}

export interface TypeDamageRelations {
  double_damage_from: { name: string; url: string }[]
  half_damage_from: { name: string; url: string }[]
  no_damage_from: { name: string; url: string }[]
}

export interface TypeData {
  name: string
  damage_relations: TypeDamageRelations
}

export interface PokemonSpecies {
  genera: {
    genus: string
    language: { name: string }
  }[]
  generation: {
    name: string
    url: string
  }
}

export interface TypeMultiplier {
  type: string
  multiplier: number
}
