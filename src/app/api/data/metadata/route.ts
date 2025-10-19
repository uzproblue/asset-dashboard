import { NextResponse } from "next/server";
import { readFileSync, statSync } from "fs";
import { join } from "path";
import { gzip } from "zlib";
import { promisify } from "util";

const gzipAsync = promisify(gzip);

// Cache for metadata
let cachedMetadata: any = null;
let lastModified: number = 0;

export async function GET() {
  try {
    const metadataPath = join(
      process.cwd(),
      "public",
      "data",
      "assets-metadata.json"
    );

    // Check if file exists and get modification time
    const stats = statSync(metadataPath);
    const currentModified = stats.mtime.getTime();

    // Use cached metadata if file hasn't changed
    if (cachedMetadata && currentModified === lastModified) {
      const jsonString = JSON.stringify(cachedMetadata);
      const compressed = await gzipAsync(jsonString);

      return new NextResponse(compressed, {
        headers: {
          "Content-Type": "application/json",
          "Content-Encoding": "gzip",
          "Cache-Control": "public, max-age=3600",
          ETag: `"${currentModified}"`,
          "Last-Modified": stats.mtime.toUTCString(),
        },
      });
    }

    // Read and parse metadata file
    const metadataContent = readFileSync(metadataPath, "utf-8");
    const metadata = JSON.parse(metadataContent);

    // Cache the metadata
    cachedMetadata = metadata;
    lastModified = currentModified;

    const jsonString = JSON.stringify(metadata);
    const compressed = await gzipAsync(jsonString);

    return new NextResponse(compressed, {
      headers: {
        "Content-Type": "application/json",
        "Content-Encoding": "gzip",
        "Cache-Control": "public, max-age=3600",
        ETag: `"${currentModified}"`,
        "Last-Modified": stats.mtime.toUTCString(),
      },
    });
  } catch (error) {
    console.error("Error reading metadata file:", error);
    return NextResponse.json(
      { error: "Failed to load metadata" },
      { status: 500 }
    );
  }
}
