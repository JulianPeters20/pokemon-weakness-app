import { useState, useEffect, useRef, type FormEvent } from "react"
import { fetchAllPokemonNames } from "../api.ts"

interface PokemonSearchProps {
  onSelect: (name: string) => void
  onCancel: () => void
  error?: string
  placeholder?: string
  lockedNames?: Set<string>
  deadNames?: Set<string>
  activeNames?: Set<string>
  boxedNames?: Set<string>
}

export function PokemonSearch({ onSelect, onCancel, error, placeholder = "Search Pokémon...", lockedNames, deadNames, activeNames, boxedNames }: PokemonSearchProps) {
  const [value, setValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [allPokemon, setAllPokemon] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [internalError, setInternalError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAllPokemonNames()
      .then((list) => setAllPokemon(list.map((p) => p.name)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (value.trim().length >= 2) {
      const q = value.trim().toLowerCase()
      const filtered = allPokemon
        .filter((name) => name.includes(q) && !name.includes("-mega"))
        .slice(0, 10)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
      setSelectedIndex(-1)
      setInternalError("")
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [value, allPokemon])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isDisabled = (name: string) => lockedNames?.has(name.toLowerCase()) ?? false

  const getDisabledHint = (name: string): string | null => {
    const normalized = name.toLowerCase()
    if (!lockedNames?.has(normalized)) return null
    if (deadNames?.has(normalized)) return "In Graveyard"
    if (activeNames?.has(normalized)) return "In active team"
    if (boxedNames?.has(normalized)) return "In Box"
    return "Evolution line in Graveyard"
  }

  const selectSuggestion = (name: string) => {
    if (isDisabled(name)) return
    setShowSuggestions(false)
    onSelect(name)
  }

  const getBlockError = (name: string): string => {
    const normalized = name.toLowerCase()
    if (deadNames?.has(normalized)) return `"${name}" is already in the Graveyard.`
    if (activeNames?.has(normalized)) return `"${name}" is already in an active team slot.`
    if (boxedNames?.has(normalized)) return `"${name}" is already in the Box.`
    return `"${name}" evolution line is in the Graveyard.`
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return

    if (selectedIndex >= 0) {
      const selected = suggestions[selectedIndex]
      if (isDisabled(selected)) {
        setInternalError(getBlockError(selected))
        return
      }
      selectSuggestion(selected)
    } else {
      if (lockedNames?.has(trimmed.toLowerCase())) {
        setInternalError(getBlockError(trimmed))
        return
      }
      onSelect(trimmed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      const selected = suggestions[selectedIndex]
      if (isDisabled(selected)) {
        setInternalError(getBlockError(selected))
        return
      }
      selectSuggestion(selected)
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const displayError = internalError || error

  return (
    <div className="pokemon-search" ref={wrapperRef}>
      <form className="pokemon-search-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="pokemon-search-input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
          autoComplete="off"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
        />
        <button type="button" className="search-cancel-btn" onClick={onCancel} aria-label="Cancel search">
          &times;
        </button>
      </form>
      {displayError && <p className="search-error-msg">{displayError}</p>}
      {showSuggestions && (
        <ul className="suggestions-list" role="listbox">
          {suggestions.map((name, i) => {
            const disabled = isDisabled(name)
            const hint = getDisabledHint(name)
            return (
              <li
                key={name}
                role="option"
                aria-selected={i === selectedIndex}
                aria-disabled={disabled}
                className={`suggestion-item ${i === selectedIndex ? "selected" : ""} ${disabled ? "suggestion-item--disabled" : ""}`}
                onMouseDown={() => !disabled && selectSuggestion(name)}
              >
                {name}
                {hint && <span className="suggestion-disabled-note"> {hint}</span>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
