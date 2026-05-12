import type { TypeMultiplier, TypeDamageRelations } from "./types.ts"

export function combineDamageRelations(
  relations: TypeDamageRelations[],
): Record<string, number> {
  const multipliers: Record<string, number> = {}

  for (const rel of relations) {
    for (const t of rel.double_damage_from) {
      const key = t.name
      multipliers[key] = (multipliers[key] ?? 1) * 2
    }
    for (const t of rel.half_damage_from) {
      const key = t.name
      multipliers[key] = (multipliers[key] ?? 1) * 0.5
    }
    for (const t of rel.no_damage_from) {
      const key = t.name
      multipliers[key] = (multipliers[key] ?? 1) * 0
    }
  }

  return multipliers
}

export function calculateWeaknesses(multipliers: Record<string, number>): TypeMultiplier[] {
  const seen = new Set<string>()
  const result: TypeMultiplier[] = []

  for (const type of Object.keys(multipliers).sort()) {
    if (seen.has(type)) continue
    seen.add(type)
    result.push({ type, multiplier: multipliers[type] })
  }

  return result
}
