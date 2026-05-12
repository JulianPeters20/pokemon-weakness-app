import { useState, useEffect, useRef, type FormEvent } from "react"
import { fetchAllPokemonNames } from "../api.ts"

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [allPokemon, setAllPokemon] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAllPokemonNames()
      .then((list) => setAllPokemon(list.map((p) => p.name)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (value.trim().length >= 2) {
      const q = value.trim().toLowerCase()
      const filtered = allPokemon.filter((name) => name.includes(q)).slice(0, 10)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
      setSelectedIndex(-1)
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

  const selectSuggestion = (name: string) => {
    setValue(name)
    setShowSuggestions(false)
    onSearch(name)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) {
      setShowSuggestions(false)
      onSearch(trimmed)
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
      selectSuggestion(suggestions[selectedIndex])
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          className="search-input"
          type="text"
          placeholder="Search Pokémon (e.g. pikachu, charizard, 25)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
          disabled={isLoading}
          autoComplete="off"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
        />
        <button className="search-button" type="submit" disabled={isLoading || !value.trim()}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>
      {showSuggestions && (
        <ul className="suggestions-list" role="listbox">
          {suggestions.map((name, i) => (
            <li
              key={name}
              role="option"
              aria-selected={i === selectedIndex}
              className={`suggestion-item ${i === selectedIndex ? "selected" : ""}`}
              onMouseDown={() => selectSuggestion(name)}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}