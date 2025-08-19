import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function GET() {
  try {
    const miniappsPath = path.join(process.cwd(), "public", "miniapps")

    // Check if miniapps directory exists
    try {
      await fs.access(miniappsPath)
    } catch {
      // Directory doesn't exist, return empty array
      return NextResponse.json({ apps: [] })
    }

    const entries = await fs.readdir(miniappsPath, { withFileTypes: true })

    // Filter for directories that contain an index.html file
    const apps = []
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const indexPath = path.join(miniappsPath, entry.name, "index.html")
        try {
          await fs.access(indexPath)
          apps.push(entry.name)
        } catch {
          // No index.html found, skip this directory
        }
      }
    }

    return NextResponse.json({ apps })
  } catch (error) {
    console.error("Error scanning apps:", error)
    return NextResponse.json({ apps: [] })
  }
}
