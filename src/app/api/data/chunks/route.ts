import { NextResponse } from "next/server";
import { readFileSync, statSync } from "fs";
import { join } from "path";
import { gzip } from "zlib";
import { promisify } from "util";

const gzipAsync = promisify(gzip);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10000");

    const chunksDir = join(process.cwd(), "public", "data", "chunks");
    const chunkPath = join(chunksDir, `assets-chunk-${page}.json`);

    // Check if chunk exists
    try {
      const stats = statSync(chunkPath);
      const chunkContent = readFileSync(chunkPath, "utf-8");
      const data = JSON.parse(chunkContent);

      // Compress the response
      const compressed = await gzipAsync(chunkContent);

      return new NextResponse(compressed, {
        headers: {
          "Content-Type": "application/json",
          "Content-Encoding": "gzip",
          "Cache-Control": "public, max-age=3600",
          "Last-Modified": stats.mtime.toUTCString(),
        },
      });
    } catch (chunkError) {
      // Chunk doesn't exist, return empty array
      const emptyData = [];
      const compressed = await gzipAsync(JSON.stringify(emptyData));

      return new NextResponse(compressed, {
        headers: {
          "Content-Type": "application/json",
          "Content-Encoding": "gzip",
          "Cache-Control": "public, max-age=300",
        },
      });
    }
  } catch (error) {
    console.error("Error loading chunk:", error);
    return NextResponse.json(
      { error: "Failed to load data chunk" },
      { status: 500 }
    );
  }
}
