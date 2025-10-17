import { AssetData, OptimizedData } from "./data";

// Parse JSON data (much faster than CSV parsing)
export function parseJSON(jsonContent: string): OptimizedData {
  try {
    return JSON.parse(jsonContent) as OptimizedData;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error("Failed to parse JSON data");
  }
}

// Legacy CSV parsing (kept for fallback)
export function parseCSV(csvContent: string): AssetData[] {
  const lines = csvContent.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  const data: AssetData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length !== headers.length) continue;

    const row: Record<string, string | number> = {};
    headers.forEach((header, index) => {
      const value = values[index];

      // Convert numeric fields
      if (
        [
          "price_date",
          "value_eur",
          "release_date",
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

    data.push(row as AssetData);
  }

  return data;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}
