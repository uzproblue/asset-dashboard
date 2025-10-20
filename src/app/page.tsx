"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useTransition,
  memo,
} from "react";
import { Header } from "@/components/Header";
import { ChartArea } from "@/components/ChartArea";
import { FilterSelect } from "@/components/FilterSelect";
import { TabNavigation } from "@/components/TabNavigation";
import { AssetsTable } from "@/components/AssetsTable";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import {
  AssetData,
  ProcessedAssetData,
  OptimizedData,
  Language,
  translations,
  processAssetData,
  getUniqueValues,
  filterData,
  groupDataByAsset,
  getFilteredOptions,
} from "@/lib/data";
import { parseCSV, parseJSON } from "@/lib/csv-parser";
import { debounce } from "@/lib/performance";

function HomePage() {
  const [optimizedData, setOptimizedData] = useState<OptimizedData | null>(
    null
  );
  const [processedData, setProcessedData] = useState<ProcessedAssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>("en");
  const [showIndexed, setShowIndexed] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "basket">("search");

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  // Date filter states
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Use transition for non-urgent updates
  const [isPending, startTransition] = useTransition();

  const t = translations[language];

  // Load data on component mount with chunked loading
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try metadata API first (lightweight)
        const metadataResponse = await fetch("/api/data/metadata");
        if (metadataResponse.ok) {
          const metadataText = await metadataResponse.text();
          const metadata = parseJSON(metadataText);
          setOptimizedData(metadata);

          // Load first chunk immediately for fast initial render
          const firstChunkResponse = await fetch("/api/data/chunks?page=1");
          if (firstChunkResponse.ok) {
            const chunkText = await firstChunkResponse.text();
            const firstChunk = parseJSON(chunkText);
            setProcessedData(firstChunk as unknown as ProcessedAssetData[]);

            // Load remaining chunks in background
            const totalChunks = (metadata.metadata as any).totalChunks || 1;
            if (totalChunks > 1) {
              loadRemainingChunks(
                totalChunks,
                firstChunk as unknown as ProcessedAssetData[]
              );
            }
          }
        } else {
          // Fallback to full data API
          const response = await fetch("/api/data");
          if (!response.ok) {
            throw new Error("API failed");
          }
          const jsonText = await response.text();
          const parsed = parseJSON(jsonText);
          setOptimizedData(parsed);
          setProcessedData(parsed.data);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        // Fallback: try to load CSV from public folder
        try {
          const response = await fetch("/data/assets.csv");
          if (!response.ok) {
            throw new Error("Public folder failed");
          }
          const csvText = await response.text();
          const parsed = parseCSV(csvText);
          setProcessedData(processAssetData(parsed));
        } catch (fallbackError) {
          console.error("Fallback data loading failed:", fallbackError);
          // Set empty data to prevent infinite loading
          setProcessedData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    // Load remaining chunks in background
    const loadRemainingChunks = async (
      totalChunks: number,
      initialData: ProcessedAssetData[]
    ) => {
      const allData = [...initialData];

      for (let i = 2; i <= totalChunks; i++) {
        try {
          const chunkResponse = await fetch(`/api/data/chunks?page=${i}`);
          if (chunkResponse.ok) {
            const chunkText = await chunkResponse.text();
            const chunk = parseJSON(chunkText);
            allData.push(...(chunk as unknown as ProcessedAssetData[]));

            // Update data progressively
            setProcessedData([...allData]);

            // Small delay to prevent overwhelming the UI
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`Error loading chunk ${i}:`, error);
        }
      }
    };

    loadData();
  }, []);

  // Get dynamic filter options based on current selections (cascading filters)
  const filterOptions = useMemo(() => {
    const currentFilters = {
      categories: selectedCategories,
      subcategories: selectedSubcategories,
      experts: selectedExperts,
      assets: selectedAssets,
    };

    // Use optimized indexes for initial data, fallback to processed data
    const baseData = optimizedData?.data || processedData;

    return getFilteredOptions(baseData, currentFilters);
  }, [
    optimizedData,
    processedData,
    selectedCategories,
    selectedSubcategories,
    selectedExperts,
    selectedAssets,
  ]);

  const { categories, subcategories, experts, assets } = filterOptions;

  // Calculate min/max dates from dataset
  const dateRange = useMemo(() => {
    if (processedData.length === 0) {
      return { minDate: "", maxDate: "" };
    }

    const dates = processedData.map((item) => item.price_date_formatted);
    const sortedDates = dates.sort();
    return {
      minDate: sortedDates[0],
      maxDate: sortedDates[sortedDates.length - 1],
    };
  }, [processedData]);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let filtered = filterData(processedData, {
      categories: selectedCategories,
      subcategories: selectedSubcategories,
      experts: selectedExperts,
      assets: selectedAssets,
    });

    // Apply date range filter
    if (startDate) {
      filtered = filtered.filter(
        (item) => item.price_date_formatted >= startDate
      );
    }
    if (endDate) {
      filtered = filtered.filter(
        (item) => item.price_date_formatted <= endDate
      );
    }

    return filtered;
  }, [
    processedData,
    selectedCategories,
    selectedSubcategories,
    selectedExperts,
    selectedAssets,
    startDate,
    endDate,
  ]);

  // Get available assets from filtered data
  const availableAssets = useMemo(() => {
    const assetSet = new Set(
      filteredData.map((item: ProcessedAssetData) => item.asset_en)
    );
    return Array.from(assetSet).sort();
  }, [filteredData]);

  // Auto-clear invalid filter selections when dependencies change
  useEffect(() => {
    // Clear invalid subcategories
    if (selectedSubcategories.length > 0) {
      const validSubcategories = selectedSubcategories.filter(
        (subcategory: string) => subcategories.includes(subcategory)
      );
      if (validSubcategories.length !== selectedSubcategories.length) {
        setSelectedSubcategories(validSubcategories);
      }
    }
  }, [subcategories, selectedSubcategories]);

  useEffect(() => {
    // Clear invalid experts
    if (selectedExperts.length > 0) {
      const validExperts = selectedExperts.filter((expert: string) =>
        experts.includes(expert)
      );
      if (validExperts.length !== selectedExperts.length) {
        setSelectedExperts(validExperts);
      }
    }
  }, [experts, selectedExperts]);

  useEffect(() => {
    // Clear invalid assets
    if (selectedAssets.length > 0) {
      const validAssets = selectedAssets.filter((asset: string) =>
        assets.includes(asset)
      );
      if (validAssets.length !== selectedAssets.length) {
        setSelectedAssets(validAssets);
      }
    }
  }, [assets, selectedAssets]);

  // Debounced filter handlers with transitions for better performance
  const debouncedSetCategories = useCallback(
    debounce((...args: unknown[]) => {
      const categories = args[0] as string[];
      startTransition(() => setSelectedCategories(categories));
    }, 300),
    [startTransition]
  );

  const debouncedSetSubcategories = useCallback(
    debounce((...args: unknown[]) => {
      const subcategories = args[0] as string[];
      startTransition(() => setSelectedSubcategories(subcategories));
    }, 300),
    [startTransition]
  );

  const debouncedSetExperts = useCallback(
    debounce((...args: unknown[]) => {
      const experts = args[0] as string[];
      startTransition(() => setSelectedExperts(experts));
    }, 300),
    [startTransition]
  );

  const debouncedSetAssets = useCallback(
    debounce((...args: unknown[]) => {
      const assets = args[0] as string[];
      startTransition(() => setSelectedAssets(assets));
    }, 300),
    [startTransition]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header language={language} onLanguageChange={setLanguage} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900 mx-auto mb-4"></div>
              <div className="text-gray-600">{t.loading}</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-sm:w-343/375 sm:w-638/744 lg:w-15/16 min-xl:w-300">
      <Header language={language} onLanguageChange={setLanguage} />

      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Page Title and Subtitle */}
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-2xl w-full leadeing-[1.5] tracking-[-0.01em] text-brand-900 m-0">
            {t.pageTitle}
          </h1>
          <h2 className="m-0 text-lg font-normal leadeing-[1.5] text-neutral-700">
            {t.pageSubtitle}
          </h2>
        </div>

        {/* Filter Section with Tabs */}
        <div className="bg-white/70 rounded-4xl shadow-filter border-neutral-200/50 border-8 px-6 py-5">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="pt-5">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {activeTab === "search" ? (
                <>
                  <FilterSelect
                    options={categories}
                    selectedValues={selectedCategories}
                    onSelectionChange={debouncedSetCategories}
                    label={t.category}
                    language={language}
                    placeholder={t.selectItem}
                  />

                  <FilterSelect
                    options={subcategories}
                    selectedValues={selectedSubcategories}
                    onSelectionChange={debouncedSetSubcategories}
                    label={t.subcategory}
                    language={language}
                    placeholder={t.selectSubcategory}
                  />

                  <FilterSelect
                    options={experts}
                    selectedValues={selectedExperts}
                    onSelectionChange={debouncedSetExperts}
                    label={t.expert}
                    language={language}
                    placeholder={t.selectSubcategory}
                  />

                  <FilterSelect
                    options={availableAssets}
                    selectedValues={selectedAssets}
                    onSelectionChange={debouncedSetAssets}
                    label={t.asset}
                    language={language}
                    placeholder={t.selectAsset}
                  />

                  <div className="relative">
                    <p className="text-sm font-medium text-neutral-900">
                      {t.date}
                    </p>
                    <div className="mt-2">
                      <DateRangeFilter
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        minDate={dateRange.minDate}
                        maxDate={dateRange.maxDate}
                        language={language}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="relative">
                  <p className="text-sm font-medium text-neutral-900">
                    {t.date}
                  </p>
                  <div className="mt-2">
                    <DateRangeFilter
                      startDate={startDate}
                      endDate={endDate}
                      onStartDateChange={setStartDate}
                      onEndDateChange={setEndDate}
                      minDate={dateRange.minDate}
                      maxDate={dateRange.maxDate}
                      language={language}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart */}
        <ChartArea
          data={filteredData}
          language={language}
          showIndexed={showIndexed}
          selectedAssets={selectedAssets}
          onToggleIndexed={setShowIndexed}
        />

        {/* Assets Detail Table */}
        <div className="mt-8">
          <AssetsTable
            data={filteredData}
            selectedAssets={selectedAssets}
            language={language}
          />
        </div>

        <span className="w-full bg-line h-0.5 my-2" ></span>

        {/* Footer Disclaimer */}
        <div className="rounded-4xl p-4 border-8 bg-white/70 border-neutral-200/50 shadow-filter gap-2.5 ">
          <p className="text-sm font-normal text-neutral-700 text-center">
            Values are estimates: past performance is not indicative of future
            results.
          </p>
        </div>
      </div>
    </main>
  );
}

// Export memoized component for better performance
export default memo(HomePage);
