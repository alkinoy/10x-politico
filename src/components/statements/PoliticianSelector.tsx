/**
 * PoliticianSelector Component
 *
 * Searchable dropdown/combobox allowing users to find and select a politician.
 * Implements ARIA combobox pattern with type-ahead search.
 * Shows politician name and party in each option.
 */

import { useState, useRef, useEffect, useId } from "react";
import type { PoliticianDTO } from "@/types";

interface PoliticianSelectorProps {
  politicians: PoliticianDTO[];
  value: string | null; // Selected politician ID
  onChange: (politicianId: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export default function PoliticianSelector({
  politicians,
  value,
  onChange,
  error,
  disabled = false,
}: PoliticianSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const comboboxId = useId();
  const listboxId = `${comboboxId}-listbox`;
  const errorId = `${comboboxId}-error`;

  // Filter politicians based on search query
  const filteredPoliticians = politicians.filter((politician) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${politician.first_name} ${politician.last_name}`.toLowerCase();
    const partyName = politician.party.name.toLowerCase();
    return fullName.includes(query) || partyName.includes(query);
  });

  // Get selected politician for display
  const selectedPolitician = politicians.find((p) => p.id === value);

  // Reset highlighted index when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const highlightedOption = listboxRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedOption) {
        highlightedOption.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    setIsOpen(true);
    // If user clears input and had a selection, clear it
    if (!newQuery && selectedPolitician) {
      onChange("");
    }
  };

  const handleSelect = (politicianId: string) => {
    onChange(politicianId);
    setSearchQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev < filteredPoliticians.length - 1 ? prev + 1 : prev));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        break;
      case "Enter":
        e.preventDefault();
        if (isOpen && filteredPoliticians.length > 0) {
          handleSelect(filteredPoliticians[highlightedIndex].id);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery("");
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // Close dropdown if focus leaves the component
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div className="space-y-2" onBlur={handleBlur}>
      <label htmlFor={comboboxId} className="block text-sm font-medium">
        Politician <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={comboboxId}
          data-testid="politician-select"
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            isOpen && filteredPoliticians.length > 0 ? `${listboxId}-option-${highlightedIndex}` : undefined
          }
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : undefined}
          aria-required="true"
          value={
            searchQuery ||
            (selectedPolitician && !isOpen ? `${selectedPolitician.first_name} ${selectedPolitician.last_name}` : "")
          }
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search for a politician..."
          disabled={disabled}
          autoComplete="off"
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "border-red-500 focus:ring-red-500" : "border-input"
          }`}
        />

        {isOpen && (
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-popover shadow-lg"
          >
            {filteredPoliticians.length > 0 ? (
              filteredPoliticians.map((politician, index) => (
                <li
                  key={politician.id}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={value === politician.id}
                  onClick={() => handleSelect(politician.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(politician.id);
                    }
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  tabIndex={0}
                  className={`cursor-pointer px-3 py-2 text-sm ${
                    index === highlightedIndex ? "bg-accent text-accent-foreground" : ""
                  } ${value === politician.id ? "font-semibold" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {politician.first_name} {politician.last_name}
                    </span>
                    <span
                      className="ml-2 rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: politician.party.color_hex ? `${politician.party.color_hex}20` : "#e5e7eb",
                        color: politician.party.color_hex || "#6b7280",
                      }}
                    >
                      {politician.party.abbreviation || politician.party.name}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-muted-foreground">No politicians found</li>
            )}
          </ul>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
