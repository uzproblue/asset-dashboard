"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  ProcessedAssetData,
  Language,
  translations,
  getMemoizedChartData,
} from "@/lib/data";

// Lazy load chart components
const Line = React.lazy(() =>
  import("react-chartjs-2").then((module) => ({ default: module.Line }))
);

// Chart configuration
let ChartJS: any = null;

const initializeChart = async () => {
  if (ChartJS) return ChartJS;

  const chartModule = await import("chart.js");
  ChartJS = chartModule.Chart;

  const {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale,
  } = chartModule;

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale
  );

  return ChartJS;
};

interface ChartAreaProps {
  data: ProcessedAssetData[];
  language: Language;
  showIndexed: boolean;
  selectedAssets: string[];
  onToggleIndexed: (showIndexed: boolean) => void;
}

export function ChartArea({
  data,
  language,
  showIndexed,
  selectedAssets,
  onToggleIndexed,
}: ChartAreaProps) {
  const [chartReady, setChartReady] = useState(false);
  const t = translations[language];

  // Initialize chart on mount
  useEffect(() => {
    initializeChart().then(() => {
      setChartReady(true);
    });
  }, []);

  // Group data by asset
  const groupedData = data.reduce(
    (acc: Record<string, ProcessedAssetData[]>, item: ProcessedAssetData) => {
      if (!acc[item.asset_en]) {
        acc[item.asset_en] = [];
      }
      acc[item.asset_en].push(item);
      return acc;
    },
    {} as Record<string, ProcessedAssetData[]>
  );

  // Sort each asset's data by date
  Object.keys(groupedData).forEach((asset: string) => {
    groupedData[asset].sort(
      (a: ProcessedAssetData, b: ProcessedAssetData) =>
        new Date(a.price_date_formatted).getTime() -
        new Date(b.price_date_formatted).getTime()
    );
  });

  // Filter to only selected assets
  const filteredAssets =
    selectedAssets.length > 0
      ? selectedAssets.filter((asset: string) => groupedData[asset])
      : Object.keys(groupedData).slice(0, 5); // Show first 5 assets if none selected

  const datasets = filteredAssets.map((asset: string, index: number) => {
    const assetData = groupedData[asset];
    const colors = [
      "#3B82F6",
      "#EF4444",
      "#10B981",
      "#F59E0B",
      "#8B5CF6",
      "#EC4899",
      "#06B6D4",
      "#84CC16",
      "#F97316",
      "#6366F1",
    ];

    // Use memoized chart data with downsampling for performance
    const chartData = getMemoizedChartData(assetData, showIndexed, 100);

    return {
      label: asset,
      data: chartData,
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + "20",
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 3,
      pointHoverRadius: 6,
    };
  });

  const chartData = {
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide default legend, we'll create custom one
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          title: (context: any) => {
            return new Date(context[0].parsed.x).toLocaleDateString();
          },
          label: (context: any) => {
            const dataset = context.dataset;
            const dataPoint = dataset.data[context.dataIndex];
            const originalData =
              groupedData[dataset.label]?.[context.dataIndex];

            if (!originalData) return "";

            return [
              `${dataset.label}`,
              `${t.value}: €${originalData.value_eur.toLocaleString()}`,
              `${t.indexedValue}: ${originalData.indexed_value.toFixed(2)}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        type: "category" as const,
        // time: {
        //   parser: "yyyy-MM-dd",
        //   displayFormats: {
        //     day: "MMM dd",
        //     month: "MMM yyyy",
        //   },
        // },
        title: {
          display: true,
          text: t.date,
        },
        grid: {
          display: true,
          color: "#E5E7EB",
        },
      },
      y: {
        title: {
          display: true,
          text: showIndexed ? t.indexedValue : t.value,
        },
        grid: {
          display: true,
          color: "#E5E7EB",
        },
        ticks: {
          callback: function (value: any) {
            if (showIndexed) {
              return value.toFixed(1);
            }
            return "€" + value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Chart
            </h3>
            <p className="text-sm text-gray-500">
              0 assets • No data available
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">No data available</div>
            <div className="text-gray-400 text-sm">
              {selectedAssets.length === 0
                ? "Select assets to view their performance"
                : "No data available for selected assets"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get current values for custom legend
  const getCurrentValues = () => {
    const currentValues: Record<string, number> = {};
    filteredAssets.forEach((asset) => {
      const assetData = groupedData[asset];
      if (assetData && assetData.length > 0) {
        const latestData = assetData[assetData.length - 1];
        currentValues[asset] = showIndexed
          ? latestData.indexed_value
          : latestData.value_eur;
      }
    });
    return currentValues;
  };

  const currentValues = getCurrentValues();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Performance Chart
          </h3>
          <p className="text-sm text-gray-500">
            {filteredAssets.length} assets • Data through 2024-10 •{" "}
            {showIndexed ? "Indexed value" : "Asset value"}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onToggleIndexed(!showIndexed)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              showIndexed
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "bg-gray-100 text-gray-700 border border-gray-300"
            }`}
          >
            Index to 100 at release
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart with Custom Legend */}
      <div className="flex">
        <div className="flex-1">
          <div className="h-96 bg-gray-50 rounded-lg">
            {chartReady ? (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <div className="text-gray-500 text-sm">
                        Loading chart...
                      </div>
                    </div>
                  </div>
                }
              >
                <Line data={chartData} options={options} />
              </Suspense>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <div className="text-gray-500 text-sm">
                    Initializing chart...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom Legend */}
        <div className="w-48 ml-6 flex flex-col justify-center space-y-3">
          {filteredAssets.map((asset, index) => {
            const colors = [
              "#8B5CF6",
              "#F59E0B",
              "#10B981",
              "#EC4899",
              "#3B82F6",
              "#EF4444",
              "#06B6D4",
              "#84CC16",
              "#F97316",
              "#6366F1",
            ];
            const color = colors[index % colors.length];
            const value = currentValues[asset];

            return (
              <div key={asset} className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {asset}
                  </div>
                  <div className="text-sm text-gray-500">
                    {showIndexed
                      ? value?.toFixed(1)
                      : `€${value?.toLocaleString() || "0"}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
