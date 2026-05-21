import type { PersistedRunState } from "./storage.ts"

const SUPPORTED_VERSIONS = [1, 2]

export interface ValidationResult {
  valid: boolean
  error: string
}

export function validateImportedRunState(data: unknown): ValidationResult {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid file: root is not a JSON object." }
  }

  const obj = data as Record<string, unknown>

  if (!("version" in obj) || typeof obj.version !== "number") {
    return { valid: false, error: "Invalid file: missing or invalid 'version' field." }
  }

  if (!SUPPORTED_VERSIONS.includes(obj.version)) {
    return { valid: false, error: `Unsupported version ${obj.version}. Expected version ${SUPPORTED_VERSIONS.join(" or ")}.` }
  }

  if (!("slots" in obj) || !Array.isArray(obj.slots)) {
    return { valid: false, error: "Invalid file: missing or invalid 'slots' array." }
  }

  if (!("graveyardEntries" in obj) || !Array.isArray(obj.graveyardEntries)) {
    return { valid: false, error: "Invalid file: missing or invalid 'graveyardEntries' array." }
  }

  if (!("encounterFilters" in obj) || typeof obj.encounterFilters !== "object") {
    return { valid: false, error: "Invalid file: missing or invalid 'encounterFilters'." }
  }

  if (!("usedLocationKeys" in obj) || !Array.isArray(obj.usedLocationKeys)) {
    return { valid: false, error: "Invalid file: missing or invalid 'usedLocationKeys' array." }
  }

  return { valid: true, error: "" }
}

export function exportRunState(state: PersistedRunState): void {
  const json = JSON.stringify(state, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "pokemon-unbound-soullink-run.json"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}
