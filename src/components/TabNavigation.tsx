"use client";

import { Language, translations } from "@/lib/data";

interface TabNavigationProps {
  activeTab: "search" | "basket";
  onTabChange: (tab: "search" | "basket") => void;
  language: Language;
}

export function TabNavigation({
  activeTab,
  onTabChange,
  language,
}: TabNavigationProps) {
  const t = translations[language];

  return (
    <div className="flex border-b border-neutral-200">
      <button
        onClick={() => onTabChange("search")}
        className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors text-brand-500 ${
          activeTab === "search"
            ? "border-brand-500 "
            : "border-transparent hover:text-border-700"
        }`}
      >
        {t.assetSearch}
      </button>
      <button
        onClick={() => onTabChange("basket")}
        className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors text-brand-500 ${
          activeTab === "basket"
            ? "border-brand-500"
            : "border-transparent hover:text-brand-700"
        }`}
      >
        {t.customBasket}
      </button>
    </div>
  );
}
