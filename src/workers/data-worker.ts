// Web Worker for data processing
// This keeps heavy operations off the main thread

interface WorkerMessage {
  type: "PROCESS_DATA" | "FILTER_DATA" | "CLEAR_CACHE";
  payload?: any;
}

interface WorkerResponse {
  type: "DATA_PROCESSED" | "DATA_FILTERED" | "CACHE_CLEARED" | "ERROR";
  payload?: any;
  error?: string;
}

// Cache for processed data
let dataCache = new Map<string, any>();

// Process CSV data in worker
function processCSVData(csvText: string): ProcessedAssetData[] {
  const lines = csvText.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  const data: ProcessedAssetData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(",");
    if (values.length !== headers.length) continue;

    const row: any = {};
    headers.forEach((header, index) => {
      const value = values[index];

      // Convert numeric fields
      if (
        [
          "value_eur",
          "issuance_value_eur",
          "number_of_splints",
          "Round indexed_at 100",
        ].includes(header)
      ) {
        row[header] = parseFloat(value) || 0;
      } else {
        row[header] = value;
      }
    });

    // Process dates
    const priceDate = parseDateString(row.price_date);
    const releaseDate = parseDateString(row.release_date);

    data.push({
      ...row,
      price_date_formatted: priceDate ? formatDate(priceDate) : null,
      release_date_formatted: releaseDate ? formatDate(releaseDate) : null,
      indexed_value: row["Round indexed_at 100"],
    });
  }

  return data;
}

// Parse date strings
function parseDateString(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;

  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (match) {
    let [, month, day, year] = match;
    year = parseInt(year);
    year = year.toString().length === 2 ? 2000 + year : year;
    return new Date(year, parseInt(month) - 1, parseInt(day));
  }

  return null;
}

// Format date
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-CA");
}

// Filter data efficiently
function filterData(
  data: ProcessedAssetData[],
  filters: any
): ProcessedAssetData[] {
  return data.filter((item) => {
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(item.category_en)
    ) {
      return false;
    }
    if (
      filters.subcategories.length > 0 &&
      !filters.subcategories.includes(item.subcategory_en)
    ) {
      return false;
    }
    if (filters.experts.length > 0 && !filters.experts.includes(item.expert)) {
      return false;
    }
    if (filters.assets.length > 0 && !filters.assets.includes(item.asset_en)) {
      return false;
    }
    return true;
  });
}

// Handle messages from main thread
self.onmessage = function (e: MessageEvent<WorkerMessage>) {
  const { type, payload } = e.data;

  try {
    switch (type) {
      case "PROCESS_DATA":
        const processedData = processCSVData(payload.csvText);
        dataCache.set("processedData", processedData);

        self.postMessage({
          type: "DATA_PROCESSED",
          payload: { data: processedData, count: processedData.length },
        } as WorkerResponse);
        break;

      case "FILTER_DATA":
        const cachedData = dataCache.get("processedData");
        if (!cachedData) {
          throw new Error("No data available for filtering");
        }

        const filteredData = filterData(cachedData, payload.filters);

        self.postMessage({
          type: "DATA_FILTERED",
          payload: { data: filteredData, count: filteredData.length },
        } as WorkerResponse);
        break;

      case "CLEAR_CACHE":
        dataCache.clear();

        self.postMessage({
          type: "CACHE_CLEARED",
        } as WorkerResponse);
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
    } as WorkerResponse);
  }
};

// Export types for TypeScript
export type { WorkerMessage, WorkerResponse };
