/**
 * SearchForm Component
 *
 * Form component allowing users to search politicians by name.
 * Includes text input, submit button, and conditional clear button.
 */

import { useState, useCallback, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchFormProps {
  initialQuery?: string;
  onSubmit: (query: string) => void;
  onClear: () => void;
}

export default function SearchForm({ initialQuery = "", onSubmit, onClear }: SearchFormProps) {
  const [inputValue, setInputValue] = useState(initialQuery);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const trimmedValue = inputValue.trim();

      // Prevent submission of empty/whitespace-only query
      if (trimmedValue === "") {
        return;
      }

      onSubmit(trimmedValue);
    },
    [inputValue, onSubmit]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    onClear();
  }, [onClear]);

  const hasValue = inputValue.trim() !== "";

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative">
        <label htmlFor="search-politicians" className="sr-only">
          Search politicians by name
        </label>
        <Input
          id="search-politicians"
          type="text"
          placeholder="Search politicians by name..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full"
          aria-label="Search politicians by name"
        />
      </div>

      <Button type="submit" variant="default" disabled={!hasValue} aria-label="Submit search">
        <svg className="size-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="hidden sm:inline">Search</span>
      </Button>

      {hasValue && (
        <Button type="button" variant="outline" onClick={handleClear} aria-label="Clear search">
          <svg className="size-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="hidden sm:inline">Clear</span>
        </Button>
      )}
    </form>
  );
}
