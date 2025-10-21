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
    performanceChart: "Performance Chart",
    assetsDetail: "Assets detail",
    downloadCSV: "Download CSV",
    searchAsset: "Search asset",
    noAssetsFound: "No assets found matching your criteria.",
    selectRange: "Select range",
    selectItem: "Select item",
    selectSubcategory: "Select subcategory",
    selectAsset: "Select asset",
    pageTitle: "Alternative Assets — Value per Splint (Monthly)",
    pageSubtitle:
      "Explore performance by asset, expert, category or your own selection.",
    releaseDate: "Release date",
    issueValue: "Issue value",
    currentValue: "Current value",
    performance: "Performance",
    assetsInSelection: "assets in current selection",
    dataThrough: "Data through 2024-10",
    assetValue: "Asset value",
    indexTo100: "Index to 100 at release",
    startDate: "Start date",
    endDate: "End date",
    clearDates: "Clear dates",
    applyDates: "Apply",
    selectDateRange: "Select date range",
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
    // New translations
    performanceChart: "Leistungsdiagramm",
    assetsDetail: "Asset-Details",
    downloadCSV: "CSV herunterladen",
    searchAsset: "Asset suchen",
    noAssetsFound: "Keine Assets gefunden, die Ihren Kriterien entsprechen.",
    selectRange: "Bereich auswählen",
    selectItem: "Element auswählen",
    selectSubcategory: "Unterkategorie auswählen",
    selectAsset: "Asset auswählen",
    pageTitle: "Alternative Assets — Wert pro Splint (Monatlich)",
    pageSubtitle:
      "Erkunden Sie die Performance nach Asset, Experte, Kategorie oder Ihrer eigenen Auswahl.",
    releaseDate: "Veröffentlichungsdatum",
    issueValue: "Ausgabewert",
    currentValue: "Aktueller Wert",
    performance: "Performance",
    assetsInSelection: "Assets in aktueller Auswahl",
    dataThrough: "Daten bis 2024-10",
    assetValue: "Asset-Wert",
    indexTo100: "Index auf 100 bei Veröffentlichung",
    startDate: "Startdatum",
    endDate: "Enddatum",
    clearDates: "Daten löschen",
    applyDates: "Anwenden",
    selectDateRange: "Datumsbereich auswählen",
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
    // New translations
    performanceChart: "Graphique de Performance",
    assetsDetail: "Détails des Actifs",
    downloadCSV: "Télécharger CSV",
    searchAsset: "Rechercher un actif",
    noAssetsFound: "Aucun actif trouvé correspondant à vos critères.",
    selectRange: "Sélectionner la plage",
    selectItem: "Sélectionner un élément",
    selectSubcategory: "Sélectionner une sous-catégorie",
    selectAsset: "Sélectionner un actif",
    pageTitle: "Actifs Alternatifs — Valeur par Splint (Mensuel)",
    pageSubtitle:
      "Explorez la performance par actif, expert, catégorie ou votre propre sélection.",
    releaseDate: "Date de sortie",
    issueValue: "Valeur d'émission",
    currentValue: "Valeur actuelle",
    performance: "Performance",
    assetsInSelection: "actifs dans la sélection actuelle",
    dataThrough: "Données jusqu'en 2024-10",
    assetValue: "Valeur de l'actif",
    indexTo100: "Index à 100 à la sortie",
    startDate: "Date de début",
    endDate: "Date de fin",
    clearDates: "Effacer les dates",
    applyDates: "Appliquer",
    selectDateRange: "Sélectionner la plage de dates",
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

  return dataToUse.map((item, index) => ({
    x: index + 1, // Sequential data point number (1-based)
    y: showIndexed ? item.indexed_value : item.value_eur,
    value_eur: item.value_eur,
    indexed_value: item.indexed_value,
  }));
}

// Memoized chart data generation with size limit
const chartDataCache = new Map<
  string,
  { x: number; y: number; value_eur: number; indexed_value: number }[]
>();

// Clear cache when it gets too large (prevent memory leaks)
const MAX_CACHE_SIZE = 50;
if (chartDataCache.size > MAX_CACHE_SIZE) {
  chartDataCache.clear();
}

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

export function getFilteredOptions(
  data: ProcessedAssetData[],
  currentFilters: {
    categories: string[];
    subcategories: string[];
    experts: string[];
    assets: string[];
  }
): {
  categories: string[];
  subcategories: string[];
  experts: string[];
  assets: string[];
} {
  let filteredData = data;

  if (currentFilters.categories.length > 0) {
    const categorySet = new Set(currentFilters.categories);
    filteredData = filteredData.filter((item) =>
      categorySet.has(item.category_en)
    );
  }

  if (currentFilters.experts.length > 0) {
    const expertSet = new Set(currentFilters.experts);
    filteredData = filteredData.filter((item) => expertSet.has(item.expert));
  }

  if (currentFilters.subcategories.length > 0) {
    const subcategorySet = new Set(currentFilters.subcategories);
    filteredData = filteredData.filter((item) =>
      subcategorySet.has(item.subcategory_en)
    );
  }

  const availableCategories = getUniqueValues(data, "category_en");

  let subcategoryData = data;
  if (currentFilters.categories.length > 0) {
    const categorySet = new Set(currentFilters.categories);
    subcategoryData = subcategoryData.filter((item) =>
      categorySet.has(item.category_en)
    );
  }
  if (currentFilters.experts.length > 0) {
    const expertSet = new Set(currentFilters.experts);
    subcategoryData = subcategoryData.filter((item) =>
      expertSet.has(item.expert)
    );
  }
  const availableSubcategories = getUniqueValues(
    subcategoryData,
    "subcategory_en"
  );

  let expertData = data;
  if (currentFilters.categories.length > 0) {
    const categorySet = new Set(currentFilters.categories);
    expertData = expertData.filter((item) => categorySet.has(item.category_en));
  }
  if (currentFilters.subcategories.length > 0) {
    const subcategorySet = new Set(currentFilters.subcategories);
    expertData = expertData.filter((item) =>
      subcategorySet.has(item.subcategory_en)
    );
  }
  const availableExperts = getUniqueValues(expertData, "expert");

  const availableAssets = getUniqueValues(filteredData, "asset_en");

  return {
    categories: availableCategories,
    subcategories: availableSubcategories,
    experts: availableExperts,
    assets: availableAssets,
  };
}

// Clear all caches for memory management
export function clearAllCaches() {
  chartDataCache.clear();
  // Clear any other caches here
}
