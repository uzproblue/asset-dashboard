"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  ProcessedAssetData,
  Language,
  translations,
  getMemoizedChartData,
} from "@/lib/data";
import Image from "next/image";

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

  // Note: Time adapter not installed, using category scale instead

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
  const MAX_CHART_ASSETS = 30;
  const allAvailableAssets = Object.keys(groupedData);

  const filteredAssets =
    selectedAssets.length > 0
      ? selectedAssets.filter((asset: string) => groupedData[asset])
      : allAvailableAssets.slice(0, MAX_CHART_ASSETS); // Show up to MAX_CHART_ASSETS if none selected

  const datasets = filteredAssets.map((asset: string, index: number) => {
    const assetData = groupedData[asset];
    const colors = [
      "#A78BFA", // Purple/Lavender
      "#FB923C", // Orange
      "#14B8A6", // Teal/Aqua
      "#F472B6", // Pink
      "#3B82F6", // Blue
      "#10B981", // Green (fallback)
      "#F59E0B", // Yellow (fallback)
      "#EF4444", // Red (fallback)
      "#8B5CF6", // Purple (fallback)
      "#06B6D4", // Cyan (fallback)
    ];

    // Use memoized chart data with downsampling for performance
    const chartData = getMemoizedChartData(assetData, showIndexed, 50);

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
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        borderColor: "transparent",
        borderWidth: 0,
        cornerRadius: 12,
        displayColors: true,
        padding: 12,
        titleFont: {
          size: 14,
          weight: "600",
        },
        bodyFont: {
          size: 13,
          weight: "400",
        },
        callbacks: {
          title: (context: any) => {
            // The x value is now a sequential data point number
            const dataPoint = context[0].parsed.x;
            if (typeof dataPoint === "number") {
              return `Data Point ${dataPoint}`;
            }
            return "";
          },
          label: (context: any) => {
            const dataset = context.dataset;
            const originalData =
              groupedData[dataset.label]?.[context.dataIndex];

            if (!originalData) return "";

            const value = showIndexed
              ? originalData.indexed_value.toFixed(2)
              : `€${originalData.value_eur.toLocaleString()}`;

            return `${dataset.label}: ${value}`;
          },
          labelColor: (context: any) => {
            return {
              borderColor: "transparent",
              backgroundColor: context.dataset.borderColor,
              borderWidth: 0,
              borderRadius: 6,
              width: 8,
              height: 8,
            };
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        title: {
          display: false,
        },
        grid: {
          display: true,
          color: "#E5E7EB",
        },
        ticks: {
          stepSize: 1,
          callback: (value: any) => value.toString(),
        },
      },
      y: {
        title: {
          display: false,
        },
        grid: {
          display: true,
          color: "#E5E7EB",
        },
        ticks: {
          callback: function (value: number) {
            if (showIndexed) {
              return value.toFixed(1);
            }
            // Format large numbers with k, M suffixes
            if (value >= 1000000) {
              return "€" + (value / 1000000).toFixed(1) + "M";
            } else if (value >= 1000) {
              return "€" + (value / 1000).toFixed(0) + "k";
            } else {
              return "€" + value.toFixed(0);
            }
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
      <div className="bg-white/70 rounded-4xl shadow-filter border-neutral-200/50 border-8 p-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-brand-900">
              {t.performanceChart}
            </h3>
            <p className="text-sm font-normal text-neutral-700">{t.noData}</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">{t.noData}</div>
            <div className="text-gray-400 text-sm">
              {selectedAssets.length === 0
                ? "Select assets to view their performance"
                : t.noData}
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

  const [enabled, setEnabled] = useState(false);

  return (
    <div className="rounded-4xl shadow-filter p-2 border-8 border-neutral-200/40 bg-white/70">
      {/* Chart Header */}
      <div className="relative flex items-center justify-between border-b border-neutral-200 px-6 py-5 gap-6 max-md:flex-col max-md:items-start">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-brand-900">
            {t.performanceChart}
          </h3>
          <p className="text-sm font-normal text-neutral-700">
            {filteredAssets.length} assets
            {allAvailableAssets.length > MAX_CHART_ASSETS &&
              selectedAssets.length === 0 && (
                <span className="text-amber-600 font-medium">
                  {" "}
                  • Showing top {MAX_CHART_ASSETS} by performance
                </span>
              )}{" "}
            • {t.dataThrough} • {showIndexed ? t.indexedValue : t.assetValue}
          </p>
        </div>
        {/*Right Side*/}
        <div className="flex gap-4 items-center justify-between pr-10 ">
          {/* Toggle Switch */}

          <button
            className="rounded-4xl"
            onClick={() => onToggleIndexed(!showIndexed)}
          >
            <div
              onClick={() => setEnabled(!enabled)}
              className={`w-10 h-5 rounded-4xl relative cursor-pointer transition-colors
              ${enabled ? "bg-brand-500" : "bg-neutral-200"}`}
            >
              <span
                className={`absolute w-4 h-4 top-0.5 rounded-4xl bg-white transition-all
              ${enabled ? "left-[22px]" : "left-[2px]"}`}
              />
            </div>
          </button>
          <p className="flex-nowrap leading-tight  font-medium text-sm transition-colors align-middle min-h-4">
            {t.indexTo100}
          </p>
        </div>
        <button className="absolute top-2 right-3 items-center w-9 h-9 rounded-xl md:top-7 justify-center">
          <Image
            src="/arrows-maximize.png"
            width={16}
            height={16}
            alt="maximize"
            className="absolute md:top-2 w-4 h-4"
          />
        </button>
      </div>

      {/* Chart with Custom Legend */}
      <div className="flex flex-col">
        <div className="border-b border-neutral-200 py-5 px-6 gap-5 bg-white/70">
          <div className="  relative h-96">
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
        <div className="w-full flex py-4 px-6 gap-2 bg-white/70 flex-wrap">
          {filteredAssets.map((asset, index) => {
            const colors = [
              "#C084FC",
              "#FB923C",
              "#2DD4BF",
              "#F472B6",
              "#38BDF8",
              "#EF4444",
              "#06B6D4",
              "#84CC16",
              "#F97316",
              "#6366F1",
            ];
            const color = colors[index % colors.length];
            const value = currentValues[asset];

            return (
              <div key={asset} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="w-full flex gap-1 flex-col flex-wrap">
                  <div className="text-sm font-normal text-neutral-900 align-right min-sm:min-w-80">
                    {asset}
                  </div>
                  {/* <div className="text-sm text-gray-500">
                    {showIndexed
                      ? value?.toFixed(1)
                      : `€${value?.toLocaleString() || "0"}`}
                  </div> */}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
