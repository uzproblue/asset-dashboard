"use client";

import { useState, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ProcessedAssetData, Language, translations } from "@/lib/data";

interface AssetsTableProps {
  data: ProcessedAssetData[];
  selectedAssets: string[];
  language: Language;
}

export function AssetsTable({
  data,
  selectedAssets,
  language,
}: AssetsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  // Calculate performance percentage
  const calculatePerformance = (item: ProcessedAssetData) => {
    const performance =
      ((item.value_eur - item.issuance_value_eur) / item.issuance_value_eur) *
      100;
    return {
      percentage: performance,
      isPositive: performance >= 0,
    };
  };

  // CSV download function
  const downloadCSV = () => {
    if (filteredData.length === 0) {
      return; // Don't download if no data
    }

    // Define CSV headers (translated)
    const headers = [
      t.asset,
      t.category,
      t.subcategory,
      t.expert,
      t.releaseDate,
      t.issueValue,
      t.currentValue,
      t.performance,
    ];

    // Convert data to CSV rows
    const rows = filteredData.map((item) => {
      const perf = calculatePerformance(item);
      return [
        item.asset_en,
        item.category_en,
        item.subcategory_en,
        item.expert,
        item.release_date_formatted,
        item.issuance_value_eur.toFixed(2),
        item.value_eur.toFixed(2),
        `${perf.percentage.toFixed(2)}%`,
      ];
    });

    // Combine headers and rows with proper CSV escaping
    const csvContent = [
      headers.map((header) => `"${header.replace(/"/g, '""')}"`).join(","),
      ...rows.map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `assets-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
  };

  // Filter and sort data based on selected assets and search term (memoized for performance)
  const filteredData = useMemo(() => {
    return data
      .filter(
        (item) =>
          selectedAssets.length === 0 || selectedAssets.includes(item.asset_en)
      )
      .filter(
        (item) =>
          searchTerm === "" ||
          item.asset_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.subcategory_en
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.expert.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        // Sort by performance (descending) - best performers first
        const perfA = calculatePerformance(a).percentage;
        const perfB = calculatePerformance(b).percentage;
        return perfB - perfA;
      });
  }, [data, selectedAssets, searchTerm]);

  // Virtual scrolling setup - optimized for performance
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45, // Reduced row height for better performance
    overscan: 3, // Reduced overscan for better memory usage
  });

  return (
    <div className="relative bg-white/70 rounded-4xl shadow-filter border-neutral-200/50 border-8 p-2 ">
      {/* Table Header*/}
      <div className="flex flex-col items-start py-5 px-6 gap-4 justify-between">
        <button
          onClick={downloadCSV}
          disabled={filteredData.length === 0}
          className="max-sm:w-90/100 max-sm:order-last sm:absolute top-5 right-6 rounded-xl py-2 px-3 gap-2 bg-brand-500 hover:bg-brand-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
              <path d="M12 10v6" />
              <path d="M9.5 13.5L12 16l2.5-2.5" />
            </svg>
            {t.downloadCSV}
          </span>
        </button>
        <div className="flex flex-col border-b border-neutral-200 pb-4 gap-4 w-full">
          <h3 className="text-lg font-bold text-brand-900">{t.assetsDetail}</h3>
          <h4 className="text-sm font-normal text-neutral-700">
            {filteredData.length} {t.assetsInSelection}
          </h4>
        </div>

        <div className="relative max-sm:w-90/100 ">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ">
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
            placeholder={t.searchAsset}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 px-3 py-2 w-full  border bg-neutral-50 border-neutral-200 rounded-xl text-sm font-normal text-neutral-700 placeholder-neutral-700 focus:ring-2 focus:ring-brand-100 focus:border-brand-100  hover:border-brand-100 hover:border-2 focus:outline-none"
          />
        </div>
      </div>
      {/* Table Body */}
      <div className="w-full xl:mx-[-8px] ">
        <div className="max-xl:overflow-x-auto w-full">
          <table className="min-w-full ">
            <thead>
              <tr className="xl:grid xl:grid-cols-9  max-xl:py-4 max-xl:px-4 xl:gap-4 xl:px-5 xl:py-2  text-neutral-700 text-left tracking-normal border-b border-t border-neutral-200 items-center flex justify-left xl:bg-table-row/80 max-xl:gap-2.5">
                <th className="pl-3 min-w-40 text-xs font-medium min-h-5 max-xl:hidden">
                  {t.asset}
                </th>
                <th className="min-w-40 pl-3 text-xs font-medium min-h-5 max-xl:hidden">
                  {t.category}
                </th>
                <th className="min-w-40 pl-3 text-xs font-medium min-h-5 max-xl:hidden">
                  {t.subcategory}
                </th>
                <th className="min-w-40 pl-3 text-xs font-medium min-h-5 max-xl:hidden">
                  {t.expert}
                </th>
                <th className="max-xl:rounded-lg max-xl:py-2 text-center max-xl:px-3 xl:pr-3 text-xs font-medium min-h-5 min-w-30.5 max-xl:bg-table-row/80 max-xl:h-9 max-xl:order-4">
                  <span className="flex gap-2 items-center xl:justify-left max-xl:justify-center">
                    {t.releaseDate}
                    <svg
                      width="11.33"
                      height="8"
                      viewBox="0 0 11.33 8"
                      fill="none"
                      stroke="#7E7F7A"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="0.6" y1="1" x2="7.5" y2="1" />

                      <line x1="0.6" y1="4" x2="6.2" y2="4" />

                      <line x1="0.6" y1="7" x2="4.7" y2="7" />

                      <line x1="9.5" y1="1" x2="9.5" y2="7" />

                      <polyline points="8 5.3 9.5 7 11 5.3" />
                    </svg>
                  </span>
                </th>
                <th className="max-xl:rounded-lg max-xl:px-3 max-xl:py-2 xl:pl-4 text-xs font-medium min-h-5 min-w-28.5 max-xl:bg-table-row/80  max-xl:h-9 max-xl:order-3">
                  <span className="flex gap-2 pl-2 items-center justify-left max-xl:justify-center ">
                    {t.issueValue}
                    <svg
                      width="11.33"
                      height="8"
                      viewBox="0 0 11.33 8"
                      fill="none"
                      stroke="#7E7F7A"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="0.6" y1="1" x2="7.5" y2="1" />

                      <line x1="0.6" y1="4" x2="6.2" y2="4" />

                      <line x1="0.6" y1="7" x2="4.7" y2="7" />

                      <line x1="9.5" y1="1" x2="9.5" y2="7" />

                      <polyline points="8 5.3 9.5 7 11 5.3" />
                    </svg>
                  </span>
                </th>
                <th className="xl:pl-3 text-xs font-medium min-h-5 min-w-31.5 max-xl:rounded-lg max-xl:px-3 max-xl:py-2 max-xl:bg-table-row/80  max-xl:h-9 max-xl:order-2">
                  <span className="flex gap-2 items-center justify-left max-xl:justify-center">
                    {t.currentValue}
                    <svg
                      width="11.33"
                      height="8"
                      viewBox="0 0 11.33 8"
                      fill="none"
                      stroke="#7E7F7A"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="0.6" y1="1" x2="7.5" y2="1" />

                      <line x1="0.6" y1="4" x2="6.2" y2="4" />

                      <line x1="0.6" y1="7" x2="4.7" y2="7" />

                      <line x1="9.5" y1="1" x2="9.5" y2="7" />

                      <polyline points="8 5.3 9.5 7 11 5.3" />
                    </svg>
                  </span>
                </th>
                <th className="xl:pl-3 text-xs font-medium min-h-5 min-w-30.75 max-xl:rounded-lg max-xl:px-3 max-xl:py-2 max-xl:bg-table-row/80  max-xl:h-9 max-xl:order-1">
                  <span className="flex gap-2 items-center max-xl:justify-center">
                    {t.performance}
                    <svg
                      width="11.33"
                      height="8"
                      viewBox="0 0 11.33 8"
                      fill="none"
                      stroke="#7E7F7A"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="0.6" y1="1" x2="7.5" y2="1" />

                      <line x1="0.6" y1="4" x2="6.2" y2="4" />

                      <line x1="0.6" y1="7" x2="4.7" y2="7" />

                      <line x1="9.5" y1="1" x2="9.5" y2="7" />

                      <polyline points="8 5.3 9.5 7 11 5.3" />
                    </svg>
                  </span>
                </th>
                <th className="max-w-15">{/* Star column */}</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Virtual scrolling container */}
        <div
          ref={parentRef}
          className="h-96 overflow-y-auto max-xl:pt-4"
          style={{
            contain: "strict",
          }}
        >
          <div className="relative w-full h-auto ">
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = filteredData[virtualItem.index];
              const performance = calculatePerformance(item);

              return (
                <div
                  className="xl:absolute top-0 left-0 width-full max-xl:bg-white/70 flex flex-row xl:h-auto max-xl:h-47.75 max-sm:h-70 max-xl:w-full max-xl:justify-center"
                  key={virtualItem.key}
                  style={{
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div className="xl:hover:bg-gray-50 xl:border-b border-neutral-200 max-xl:w-73/79">
                    <div className="max-xl:hidden bg-white/70 xl:pr-3 xl:pl-7 xl:py-2 xl:grid xl:grid-cols-9 xl:gap-8 xl:min-h-12.5 xl:items-center ">
                      <div className="text-sm font-normal text-neutral-900 truncate">
                        {item.asset_en}
                      </div>
                      <div className="text-sm font-normal text-neutral-900 truncate">
                        {item.category_en}
                      </div>
                      <div className="text-sm font-normal text-neutral-900 truncate">
                        {item.subcategory_en}
                      </div>
                      <div className="text-sm font-normal text-neutral-900 truncate">
                        {item.expert}
                      </div>
                      <div className="text-sm font-normal text-neutral-900 truncate">
                        {new Date(
                          item.release_date_formatted
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-sm font-normal text-neutral-900 truncate text-right">
                        €{item.issuance_value_eur.toFixed(2)}
                      </div>
                      <div className="text-sm font-normal text-neutral-900 truncate text-right">
                        €{item.value_eur.toFixed(2)}
                      </div>
                      <div className="text-right">
                        <span
                          className={`py-1 px-2 gap-1 text-xs font-medium rounded-4xl inline-flex border items-center ${
                            performance.isPositive
                              ? "text-green-600 border-green-200 bg-green-50"
                              : "text-red-600 border-red-200 bg-red-50"
                          }`}
                        >
                          {performance.isPositive ? (
                            <svg
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {Math.abs(performance.percentage).toFixed(1)}%
                        </span>
                      </div>
                      <div className="py-2 pr-6 pl-3 max-xl:hidden">
                        <button className="text-neutral-700 transition-transform duration-200 hover:-translate-y-0.5 group hover:bg-brand-100/50 p-0.5 rounded-sm">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="xl:hidden max-xl:rounded-lg max-xl:border max-xl:bg-white/70 max-xl:shadow-filter border-neutral-200 max-xl:flex max-xl:flex-col max-xl:gap-2">
                      <div className="flex flex-col border-b p-4 gap-3 border-neutral-200">
                        <div className="flex gap-2 justify-between">
                          <div className="text-neutral-900 text-base font-medium">
                            {item.asset_en}
                          </div>
                          <button className=" text-neutral-700 transition-transform duration-200 hover:-translate-y-0.5 group hover:bg-brand-100/50 p-0.5 rounded-sm">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex gap-8 max-sm:gap-2 w-full">
                          <div className="flex flex-col gap-2">
                            <span className="text-xs font-medium text-neutral-700">
                              {t.issueValue}
                            </span>
                            <div className="text-sm font-medium text-neutral-900 truncate text-right">
                              €{item.issuance_value_eur.toFixed(2)}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 items-start">
                            <span className="text-xs font-medium text-neutral-700">
                              {t.currentValue}
                            </span>
                            <div className="text-sm font-medium text-neutral-900 truncate text-right">
                              €{item.value_eur.toFixed(2)}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 items-start">
                            <span className="text-xs font-medium text-neutral-700">
                              {t.performance}
                            </span>
                            <div className="text-right">
                              <span
                                className={`py-1 px-2 gap-1 text-xs font-medium rounded-4xl inline-flex border items-center ${
                                  performance.isPositive
                                    ? "text-green-600 border-green-200 bg-green-50"
                                    : "text-red-600 border-red-200 bg-red-50"
                                }`}
                              >
                                {performance.isPositive ? (
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                                {Math.abs(performance.percentage).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="sm:grid sm:grid-cols-4 max-sm:justify-between max-sm:flex max-sm:flex-col p-4 gap-2">
                        <div className="flex flex-col max-sm:flex-row gap-1">
                          <span className="text-xs font-medium text-neutral-700 w-full max-sm:flex-1">
                            Category
                          </span>
                          <div className="text-sm font-normal text-neutral-900 max-sm:flex-1">
                            {item.category_en}
                          </div>
                        </div>

                        <div className="flex flex-col max-sm:flex-row max-sm:items-center gap-1 w-full">
                          <span className="max-xl:text-xs font-medium text-neutral-700 max-sm:flex-1">
                            Subcategory
                          </span>
                          <div className="text-sm font-normal text-neutral-900 truncate max-sm:flex-1">
                            {item.subcategory_en}
                          </div>
                        </div>

                        <div className="flex flex-col max-sm:flex-row gap-1 max-sm:items-center w-full">
                          <span className="text-xs font-medium text-neutral-700 max-sm:flex-1">
                            Expert
                          </span>
                          <div className="text-sm font-normal text-neutral-900 truncate max-sm:flex-1">
                            {item.expert}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 max-sm:flex-row max-sm:items-center w-full">
                          <span className="xl:hidden max-xl:text-xs max-xl:font-medium max-xl:text-neutral-700 max-sm:flex-1">
                            Release date
                          </span>
                          <div className="text-sm font-normal text-neutral-900 truncate max-sm:flex-1">
                            {new Date(
                              item.release_date_formatted
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-neutral-700">
          No assets found matching your criteria.
        </div>
      )}
    </div>
  );
}
