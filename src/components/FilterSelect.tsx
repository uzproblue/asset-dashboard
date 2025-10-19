"use client";

import { useState } from "react";
import { Language, translations } from "@/lib/data";

interface FilterSelectProps {
  options: string[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  label: string;
  language: Language;
  placeholder?: string;
}

export function FilterSelect({
  options,
  selectedValues,
  onSelectionChange,
  label,
  language,
  placeholder,
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const t = translations[language];

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    } else {
      onSelectionChange([...selectedValues, value]);
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="relative">
      <div className="relative">
        <p className="text-sm font-medium text-neutral-900">
          {label}
        </p>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left bg-neutral-50 border border-neutral-200 rounded-md text-sm hover:border-brand-100 hover:border-2 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-100 text-neutral-700 mt-2 focus:ring-inset"
        >
          <div className="flex items-center gap-4" >
            <span className={selectedValues.length === 0
              ? ``
              : `border py-1 px-2 bg-neutral-100 border-neutral-200 rounded-4xl text-xs font-medium text-neutral-700`}>
              {selectedValues.length === 0
                ? placeholder || `Select ${label.toLowerCase()}...`
                : `${selectedValues.length} item`}
            </span>

          </div>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none h-4 top-9.5">
            <svg
              className={`w-4 h-4 text-neutral-700
                transition-transform ${isOpen ? "rotate-180" : ""
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-neutral-0 border border-neutral-200 rounded-md shadow-md max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="relative p-2 border-b border-neutral-200 bg-white/70">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-neutral-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder={`Search`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 pl-5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 text-neutral-700 font-normal focus:ring-neutral-200 bg-neutral-50 placeholder-neutral-700"
              />
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="py-2 px-3 text-sm text-neutral-500">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option)}
                      onChange={() => handleToggle(option)}
                      className="h-4 w-4 rounded bg-neutral-50 border border-neutral-300 accent-brand-500 accent-rounded leading-none font-inter"
                    />
                    <span className="ml-2 text-sm font-medium align-middle text-neutral-900 truncate">
                      {option}
                    </span>
                  </label>
                ))
              )}
            </div>
            {/*Clear button */}
            {filteredOptions.length > 0 && (
              <div className="border-t border-neutral-200 bg-neutral-0 flex items-center">
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={selectedValues.length === 0}
                  className="flex px-3 py-2 text-sm font-medium text-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-1">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M6 6l12 12M18 6l-12 12" />
                    </svg>
                    {t.clearAll}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
