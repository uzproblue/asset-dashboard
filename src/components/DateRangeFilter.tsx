"use client";

import { useState, useRef, useEffect } from "react";
import { Language, translations } from "@/lib/data";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minDate: string;
  maxDate: string;
  language: Language;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
  language,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  // Auto-close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleClearDates = () => {
    onStartDateChange("");
    onEndDateChange("");
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (startDate && endDate) {
      return `${startDate} - ${endDate}`;
    } else if (startDate) {
      return `${t.startDate}: ${startDate}`;
    } else if (endDate) {
      return `${t.endDate}: ${endDate}`;
    }
    return t.selectDateRange;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-neutral-50 border border-neutral-200 rounded-md text-sm hover:border-brand-100 focus:outline-none focus:ring-1 focus:ring-brand-100 focus:border-brand-100 text-neutral-700"
      >
        <span className="flex items-center">
          <svg
            className="w-4 h-4 mr-2 text-neutral-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {getDisplayText()}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`w-4 h-4 text-neutral-700 transition-transform ${
              isOpen ? "rotate-180" : ""
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg">
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {t.startDate}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  min={minDate}
                  max={endDate || maxDate}
                  className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-100 focus:border-brand-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {t.endDate}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  min={startDate || minDate}
                  max={maxDate}
                  className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-100 focus:border-brand-100"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={handleClearDates}
                className="text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
              >
                {t.clearDates}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
              >
                {t.applyDates}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
