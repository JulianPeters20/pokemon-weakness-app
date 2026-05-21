const GENERATION_RANGES: [number, number, number][] = [
  [1, 1, 151],
  [2, 152, 251],
  [3, 252, 386],
  [4, 387, 493],
  [5, 494, 649],
  [6, 650, 721],
  [7, 722, 809],
  [8, 810, 898],
  [9, 899, 9999],
]

export function getGenerationFromId(speciesId: number): number | null {
  for (const [gen, start, end] of GENERATION_RANGES) {
    if (speciesId >= start && speciesId <= end) return gen
  }
  return null
}

export function isSupportedGeneration(gen: number | null): boolean {
  return gen !== null && gen >= 1 && gen <= 7
}

export function isMega(name: string): boolean {
  return name.includes("-mega")
}

export function extractGeneration(url: string): string {
  const parts = url.replace(/\/$/, "").split("/")
  const genId = Number(parts[parts.length - 1])
  const names: Record<number, string> = {
    1: "Generation I",
    2: "Generation II",
    3: "Generation III",
    4: "Generation IV",
    5: "Generation V",
    6: "Generation VI",
    7: "Generation VII",
    8: "Generation VIII",
    9: "Generation IX",
  }
  return names[genId] ?? `Generation ${genId}`
}
