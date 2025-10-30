/**
 * AuthTabs Component
 * Tabbed interface implementing ARIA tabs pattern with keyboard navigation
 * Manages tab selection and displays appropriate form panel
 */

import React, { useRef, useCallback } from "react";
import TabButton from "./TabButton";
import TabPanel from "./TabPanel";

type ActiveTab = "signin" | "signup";

interface AuthTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  signInContent: React.ReactNode;
  signUpContent: React.ReactNode;
}

export default function AuthTabs({ activeTab, onTabChange, signInContent, signUpContent }: AuthTabsProps) {
  const signInTabRef = useRef<HTMLButtonElement>(null);
  const signUpTabRef = useRef<HTMLButtonElement>(null);

  /**
   * Handle keyboard navigation between tabs
   * Implements ARIA keyboard patterns for tabs:
   * - ArrowLeft/ArrowRight: Navigate between tabs
   * - Home: Focus first tab
   * - End: Focus last tab
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const tabs: ActiveTab[] = ["signin", "signup"];
      const currentIndex = tabs.indexOf(activeTab);

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (currentIndex > 0) {
            onTabChange(tabs[currentIndex - 1]);
            // Focus will be managed after state update
            setTimeout(() => signInTabRef.current?.focus(), 0);
          }
          break;

        case "ArrowRight":
          e.preventDefault();
          if (currentIndex < tabs.length - 1) {
            onTabChange(tabs[currentIndex + 1]);
            setTimeout(() => signUpTabRef.current?.focus(), 0);
          }
          break;

        case "Home":
          e.preventDefault();
          onTabChange(tabs[0]);
          setTimeout(() => signInTabRef.current?.focus(), 0);
          break;

        case "End":
          e.preventDefault();
          onTabChange(tabs[tabs.length - 1]);
          setTimeout(() => signUpTabRef.current?.focus(), 0);
          break;
      }
    },
    [activeTab, onTabChange]
  );

  return (
    <div className="space-y-6">
      {/* Tab List */}
      <div role="tablist" aria-label="Authentication options" className="flex border-b border-neutral-200">
        <TabButton
          id="signin-tab"
          label="Sign In"
          isActive={activeTab === "signin"}
          ariaControls="signin-panel"
          onClick={() => onTabChange("signin")}
          onKeyDown={handleKeyDown}
        />
        <TabButton
          id="signup-tab"
          label="Sign Up"
          isActive={activeTab === "signup"}
          ariaControls="signup-panel"
          onClick={() => onTabChange("signup")}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Tab Panels */}
      <TabPanel id="signin-panel" isActive={activeTab === "signin"} ariaLabelledBy="signin-tab">
        {signInContent}
      </TabPanel>

      <TabPanel id="signup-panel" isActive={activeTab === "signup"} ariaLabelledBy="signup-tab">
        {signUpContent}
      </TabPanel>
    </div>
  );
}
