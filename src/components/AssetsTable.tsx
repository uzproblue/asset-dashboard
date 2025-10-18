"use client";

import { useState, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ProcessedAssetData } from "@/lib/data";

interface AssetsTableProps {
  data: ProcessedAssetData[];
  selectedAssets: string[];
}

export function AssetsTable({ data, selectedAssets }: AssetsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);

  // Filter data based on selected assets and search term (memoized for performance)
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
      );
  }, [data, selectedAssets, searchTerm]);

  // Virtual scrolling setup
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Row height
    overscan: 10, // Render extra items for smooth scrolling
  });

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

  return (
    <div className="relative bg-white/70 rounded-4xl shadow-filter border-neutral-200/50 border-8 p-2">
      {/* Table Header*/}
      <div className="flex flex-col items-start py-5 px-6 gap-4 justify-between">
        <button className="max-sm:w-90/100 max-sm:order-last sm:absolute top-5 right-6 rounded-xl py-2 px-3 gap-2 bg-brand-500 hover:bg-brand-900 text-sm font-medium text-white">
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
            Download CSV
          </span>
        </button>
        <div className="flex flex-col border-b border-neutral-200 pb-4 gap-4 w-full">
          <h3 className="text-lg font-bold text-brand-900">
            Assets detail
          </h3>
          <h4 className="text-sm font-normal text-neutral-700">
            {filteredData.length} assets in current selection
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
            placeholder="Search asset"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 px-3 py-2 w-full  border bg-neutral-50 border-neutral-200 rounded-xl text-sm font-normal text-neutral-700 placeholder-neutral-700 focus:ring-2 focus:ring-brand-100 focus:border-brand-100  hover:border-brand-100 hover:border-2 focus:outline-none"
          />
        </div>
      </div>
      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subcategory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expert
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Release date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issue value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {/* Star column */}
              </th>
            </tr>
          </thead>
        </table>

        {/* Virtual scrolling container */}
        <div
          ref={parentRef}
          className="h-96 overflow-auto"
          style={{
            contain: "strict",
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = filteredData[virtualItem.index];
              const performance = calculatePerformance(item);

              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div className="hover:bg-gray-50 border-b border-gray-200">
                    <div className="px-6 py-4 grid grid-cols-9 gap-4 text-sm">
                      <div className="font-medium text-gray-900 truncate">
                        {item.asset_en}
                      </div>
                      <div className="text-gray-500 truncate">
                        {item.category_en}
                      </div>
                      <div className="text-gray-500 truncate">
                        {item.subcategory_en}
                      </div>
                      <div className="text-gray-500 truncate">
                        {item.expert}
                      </div>
                      <div className="text-gray-500">
                        {new Date(
                          item.release_date_formatted
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-gray-500">
                        €{item.issuance_value_eur.toFixed(2)}
                      </div>
                      <div className="text-gray-500">
                        €{item.value_eur.toFixed(2)}
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center ${performance.isPositive
                            ? "text-green-600"
                            : "text-red-600"
                            }`}
                        >
                          {performance.isPositive ? (
                            <svg
                              className="w-4 h-4 mr-1"
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
                      <div>
                        <button className="text-gray-400 hover:text-blue-600">
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No assets found matching your criteria.
        </div>
      )}
    </div>
  );
}
