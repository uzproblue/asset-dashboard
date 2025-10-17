import { NextResponse } from "next/server";
import { readFileSync, statSync } from "fs";
import { join } from "path";

// Cache for the processed data
let cachedData: any = null;
let lastModified: number = 0;

export async function GET() {
  try {
    const jsonPath = join(process.cwd(), "public", "data", "assets.json");

    // Check if file exists and get modification time
    const stats = statSync(jsonPath);
    const currentModified = stats.mtime.getTime();

    // Use cached data if file hasn't changed
    if (cachedData && currentModified === lastModified) {
      return new NextResponse(JSON.stringify(cachedData), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
          ETag: `"${currentModified}"`,
          "Last-Modified": stats.mtime.toUTCString(),
        },
      });
    }

    // Read and parse JSON file
    const jsonContent = readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(jsonContent);

    // Cache the data
    cachedData = data;
    lastModified = currentModified;

    return new NextResponse(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
        ETag: `"${currentModified}"`,
        "Last-Modified": stats.mtime.toUTCString(),
      },
    });
  } catch (error) {
    console.error("Error reading JSON file:", error);

    // Fallback to CSV if JSON doesn't exist
    try {
      const csvPath = join(process.cwd(), "public", "data", "assets.csv");
      const csvContent = readFileSync(csvPath, "utf-8");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Cache-Control": "public, max-age=300", // Shorter cache for fallback
        },
      });
    } catch (fallbackError) {
      console.error("Fallback CSV loading failed:", fallbackError);
      return NextResponse.json(
        { error: "Failed to load data" },
        { status: 500 }
      );
    }
  }
}
