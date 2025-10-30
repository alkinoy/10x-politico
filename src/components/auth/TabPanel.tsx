/**
 * TabPanel Component
 * Container for tab content with proper ARIA tabpanel pattern
 * Shows/hides based on active tab
 */

import React from "react";

interface TabPanelProps {
  id: string;
  isActive: boolean;
  ariaLabelledBy: string;
  children: React.ReactNode;
}

export default function TabPanel({ id, isActive, ariaLabelledBy, children }: TabPanelProps) {
  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={ariaLabelledBy}
      hidden={!isActive}
      tabIndex={0}
      className={`
        focus-visible:outline-none
        ${isActive ? "animate-in fade-in duration-200" : ""}
      `}
    >
      {children}
    </div>
  );
}
