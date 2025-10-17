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
import { MainContainer } from "@/components/MainContainer";
import { ChartArea } from "@/components/ChartArea";
import { FilterSelect } from "@/components/FilterSelect";
import { TabNavigation } from "@/components/TabNavigation";
import { AssetsTable } from "@/components/AssetsTable";
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

  // Use transition for non-urgent updates
  const [isPending, startTransition] = useTransition();

  const t = translations[language];

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try API first (now serves JSON)
        const response = await fetch("/api/data");
        if (!response.ok) {
          throw new Error("API failed");
        }
        const jsonText = await response.text();
        const parsed = parseJSON(jsonText);
        setOptimizedData(parsed);
        setProcessedData(parsed.data);
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

    loadData();
  }, []);

  // Get unique values for filters (use optimized indexes if available)
  const categories = useMemo(
    () =>
      optimizedData?.indexes.categories ||
      getUniqueValues(processedData, "category_en"),
    [optimizedData, processedData]
  );
  const subcategories = useMemo(
    () =>
      optimizedData?.indexes.subcategories ||
      getUniqueValues(processedData, "subcategory_en"),
    [optimizedData, processedData]
  );
  const experts = useMemo(
    () =>
      optimizedData?.indexes.experts ||
      getUniqueValues(processedData, "expert"),
    [optimizedData, processedData]
  );
  const assets = useMemo(
    () =>
      optimizedData?.indexes.assets ||
      getUniqueValues(processedData, "asset_en"),
    [optimizedData, processedData]
  );

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return filterData(processedData, {
      categories: selectedCategories,
      subcategories: selectedSubcategories,
      experts: selectedExperts,
      assets: selectedAssets,
    });
  }, [
    processedData,
    selectedCategories,
    selectedSubcategories,
    selectedExperts,
    selectedAssets,
  ]);

  // Get available assets from filtered data
  const availableAssets = useMemo(() => {
    const assetSet = new Set(
      filteredData.map((item: ProcessedAssetData) => item.asset_en)
    );
    return Array.from(assetSet).sort();
  }, [filteredData]);

  // Update selected assets when filtered data changes
  useEffect(() => {
    if (selectedAssets.length > 0) {
      const validAssets = selectedAssets.filter((asset: string) =>
        availableAssets.includes(asset)
      );
      if (validAssets.length !== selectedAssets.length) {
        setSelectedAssets(validAssets);
      }
    }
  }, [availableAssets, selectedAssets]);

  // Debounced filter handlers with transitions for better performance
  const debouncedSetCategories = useCallback(
    debounce((categories: string[]) => {
      startTransition(() => setSelectedCategories(categories));
    }, 300),
    [startTransition]
  );

  const debouncedSetSubcategories = useCallback(
    debounce((subcategories: string[]) => {
      startTransition(() => setSelectedSubcategories(subcategories));
    }, 300),
    [startTransition]
  );

  const debouncedSetExperts = useCallback(
    debounce((experts: string[]) => {
      startTransition(() => setSelectedExperts(experts));
    }, 300),
    [startTransition]
  );

  const debouncedSetAssets = useCallback(
    debounce((assets: string[]) => {
      startTransition(() => setSelectedAssets(assets));
    }, 300),
    [startTransition]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">{t.loading}</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-sm:w-343/375 sm:w-638/744 lg:w-15/16 min-xl:w-300">
      <Header />
    </main>
  );
}

// Export memoized component for better performance
export default memo(HomePage);
