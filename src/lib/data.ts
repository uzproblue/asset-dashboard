export interface AssetData {
  asset_id: string;
  price_date: number;
  value_eur: number;
  release_date: number;
  issuance_value_eur: number;
  number_of_splints: number;
  "Round indexed_at 100": number;
  asset_en: string;
  asset_de: string;
  asset_fr: string;
  category_en: string;
  category_de: string;
  category_fr: string;
  subcategory_en: string;
  subcategory_de: string;
  subcategory_fr: string;
  expert: string;
}

export interface ProcessedAssetData extends AssetData {
  price_date_formatted: string;
  release_date_formatted: string;
  indexed_value: number;
}

export interface OptimizedData {
  data: ProcessedAssetData[];
  indexes: {
    categories: string[];
    subcategories: string[];
    experts: string[];
    assets: string[];
  };
  groupedData: Record<string, ProcessedAssetData[]>;
  metadata: {
    totalRows: number;
    totalAssets: number;
    lastUpdated: string;
    version: string;
  };
}

export type Language = "en" | "de" | "fr";

export const translations = {
  en: {
    title: "Asset Value Dashboard",
    category: "Category",
    subcategory: "Subcategory",
    expert: "Expert",
    asset: "Asset",
    value: "Value (EUR)",
    indexedValue: "Indexed Value",
    date: "Date",
    watches: "Watches",
    limited: "Limited",
    selectAll: "Select All",
    clearAll: "Clear All",
    loading: "Loading...",
    noData: "No data available",
  },
  de: {
    title: "Asset-Wert Dashboard",
    category: "Kategorie",
    subcategory: "Unterkategorie",
    expert: "Experte",
    asset: "Asset",
    value: "Wert (EUR)",
    indexedValue: "Indexierter Wert",
    date: "Datum",
    watches: "Uhren",
    limited: "Limitierte",
    selectAll: "Alle auswählen",
    clearAll: "Alle löschen",
    loading: "Laden...",
    noData: "Keine Daten verfügbar",
  },
  fr: {
    title: "Tableau de Bord des Valeurs d'Actifs",
    category: "Catégorie",
    subcategory: "Sous-catégorie",
    expert: "Expert",
    asset: "Actif",
    value: "Valeur (EUR)",
    indexedValue: "Valeur Indexée",
    date: "Date",
    watches: "Montres",
    limited: "Limité",
    selectAll: "Tout sélectionner",
    clearAll: "Tout effacer",
    loading: "Chargement...",
    noData: "Aucune donnée disponible",
  },
};

// Convert Excel date number to JavaScript Date
export function excelDateToJSDate(excelDate: number): Date {
  const excelEpoch = new Date(1900, 0, 1);
  const jsDate = new Date(
    excelEpoch.getTime() + (excelDate - 2) * 24 * 60 * 60 * 1000
  );
  return jsDate;
}

// Format date for display
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
}

// Process raw asset data
export function processAssetData(rawData: AssetData[]): ProcessedAssetData[] {
  return rawData.map((item) => ({
    ...item,
    price_date_formatted: formatDate(excelDateToJSDate(item.price_date)),
    release_date_formatted: formatDate(excelDateToJSDate(item.release_date)),
    indexed_value: item["Round indexed_at 100"],
  }));
}

// Get unique values for filters
export function getUniqueValues(
  data: ProcessedAssetData[],
  field: keyof ProcessedAssetData
): string[] {
  const values = new Set(data.map((item) => item[field] as string));
  return Array.from(values).sort();
}

// Optimized filter data with early returns and Set lookups
export function filterData(
  data: ProcessedAssetData[],
  filters: {
    categories: string[];
    subcategories: string[];
    experts: string[];
    assets: string[];
  }
): ProcessedAssetData[] {
  // Convert arrays to Sets for O(1) lookup
  const categorySet =
    filters.categories.length > 0 ? new Set(filters.categories) : null;
  const subcategorySet =
    filters.subcategories.length > 0 ? new Set(filters.subcategories) : null;
  const expertSet =
    filters.experts.length > 0 ? new Set(filters.experts) : null;
  const assetSet = filters.assets.length > 0 ? new Set(filters.assets) : null;

  return data.filter((item) => {
    // Early returns for better performance
    if (categorySet && !categorySet.has(item.category_en)) return false;
    if (subcategorySet && !subcategorySet.has(item.subcategory_en))
      return false;
    if (expertSet && !expertSet.has(item.expert)) return false;
    if (assetSet && !assetSet.has(item.asset_en)) return false;

    return true;
  });
}

// Group data by asset for charting
export function groupDataByAsset(
  data: ProcessedAssetData[]
): Record<string, ProcessedAssetData[]> {
  const grouped: Record<string, ProcessedAssetData[]> = {};

  data.forEach((item) => {
    if (!grouped[item.asset_en]) {
      grouped[item.asset_en] = [];
    }
    grouped[item.asset_en].push(item);
  });

  // Sort each group by date
  Object.keys(grouped).forEach((asset) => {
    grouped[asset].sort(
      (a, b) =>
        new Date(a.price_date_formatted).getTime() -
        new Date(b.price_date_formatted).getTime()
    );
  });

  return grouped;
}

// Get chart data for a specific asset with downsampling for performance
export function getChartData(
  assetData: ProcessedAssetData[],
  showIndexed: boolean = false,
  maxPoints: number = 100
) {
  // Downsample data if it has too many points
  let dataToUse = assetData;
  if (assetData.length > maxPoints) {
    const step = Math.ceil(assetData.length / maxPoints);
    dataToUse = assetData.filter((_, index) => index % step === 0);
  }

  return dataToUse.map((item) => ({
    x: item.price_date_formatted,
    y: showIndexed ? item.indexed_value : item.value_eur,
    value_eur: item.value_eur,
    indexed_value: item.indexed_value,
  }));
}

// Memoized chart data generation
const chartDataCache = new Map<
  string,
  { x: string; y: number; value_eur: number; indexed_value: number }[]
>();

export function getMemoizedChartData(
  assetData: ProcessedAssetData[],
  showIndexed: boolean = false,
  maxPoints: number = 100
) {
  const cacheKey = `${assetData.length}-${showIndexed}-${maxPoints}`;

  if (chartDataCache.has(cacheKey)) {
    return chartDataCache.get(cacheKey);
  }

  const result = getChartData(assetData, showIndexed, maxPoints);
  chartDataCache.set(cacheKey, result);

  return result;
}

// Clear cache when needed
export function clearChartDataCache() {
  chartDataCache.clear();
}
