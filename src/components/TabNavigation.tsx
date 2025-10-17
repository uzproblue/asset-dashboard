"use client";

interface TabNavigationProps {
  activeTab: "search" | "basket";
  onTabChange: (tab: "search" | "basket") => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex border-b border-gray-200">
      <button
        onClick={() => onTabChange("search")}
        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
          activeTab === "search"
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
      >
        Asset search
      </button>
      <button
        onClick={() => onTabChange("basket")}
        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
          activeTab === "basket"
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
      >
        Custom basket
      </button>
    </div>
  );
}
