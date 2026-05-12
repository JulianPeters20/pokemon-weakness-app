import { useState, type FormEvent } from "react"

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) {
      onSearch(trimmed)
    }
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        className="search-input"
        type="text"
        placeholder="Search Pokémon (e.g. pikachu, charizard, 25)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isLoading}
      />
      <button className="search-button" type="submit" disabled={isLoading || !value.trim()}>
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  )
}
