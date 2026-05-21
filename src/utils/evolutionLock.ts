const speciesToEvoChainUrl = new Map<string, string | null>()
const evoChainUrlToMembers = new Map<string, string[]>()
const pendingSpecies = new Map<string, Promise<string | null>>()
const pendingChains = new Map<string, Promise<string[]>>()

function extractChainMemberNames(chain: {
  species: { name: string }
  evolves_to: typeof chain[]
}): string[] {
  const names: string[] = [chain.species.name]
  for (const child of chain.evolves_to) {
    names.push(...extractChainMemberNames(child))
  }
  return names
}

async function getEvoChainUrl(speciesUrl: string): Promise<string | null> {
  if (speciesToEvoChainUrl.has(speciesUrl)) {
    return speciesToEvoChainUrl.get(speciesUrl)!
  }

  if (pendingSpecies.has(speciesUrl)) {
    return pendingSpecies.get(speciesUrl)!
  }

  const promise = (async (): Promise<string | null> => {
    try {
      const res = await fetch(speciesUrl)
      if (!res.ok) return null
      const data = await res.json()
      const url: string | null = data.evolution_chain?.url ?? null
      speciesToEvoChainUrl.set(speciesUrl, url)
      return url
    } catch {
      speciesToEvoChainUrl.set(speciesUrl, null)
      return null
    }
  })()

  pendingSpecies.set(speciesUrl, promise)
  const result = await promise
  pendingSpecies.delete(speciesUrl)
  return result
}

async function getChainMembers(chainUrl: string): Promise<string[]> {
  if (evoChainUrlToMembers.has(chainUrl)) {
    return evoChainUrlToMembers.get(chainUrl)!
  }

  if (pendingChains.has(chainUrl)) {
    return pendingChains.get(chainUrl)!
  }

  const promise = (async (): Promise<string[]> => {
    try {
      const res = await fetch(chainUrl)
      if (!res.ok) return []
      const data = await res.json()
      const members = extractChainMemberNames(data.chain)
      evoChainUrlToMembers.set(chainUrl, members)
      return members
    } catch {
      return []
    }
  })()

  pendingChains.set(chainUrl, promise)
  const result = await promise
  pendingChains.delete(chainUrl)
  return result
}

export async function getEvolutionLineMemberNames(speciesUrl: string): Promise<string[]> {
  const chainUrl = await getEvoChainUrl(speciesUrl)
  if (!chainUrl) return []
  return getChainMembers(chainUrl)
}

export function clearEvolutionCache(): void {
  speciesToEvoChainUrl.clear()
  evoChainUrlToMembers.clear()
  pendingSpecies.clear()
  pendingChains.clear()
}
