/**
 * TabButton Component
 * Individual tab button within the tab list
 * Shows active/inactive state and handles selection
 */

import React from "react";

interface TabButtonProps {
  id: string;
  label: string;
  isActive: boolean;
  ariaControls: string;
  onClick: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export default function TabButton({ id, label, isActive, ariaControls, onClick, onKeyDown }: TabButtonProps) {
  return (
    <button
      id={id}
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-controls={ariaControls}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`
        flex-1 px-4 py-3 text-sm font-medium transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2
        ${
          isActive
            ? "text-neutral-900 border-b-2 border-neutral-900 bg-white"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border-b-2 border-transparent"
        }
      `}
    >
      {label}
    </button>
  );
}
