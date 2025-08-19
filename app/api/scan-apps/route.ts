import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

async function isNextJsApp(appPath: string): Promise<boolean> {
  try {
    const packageJsonPath = path.join(appPath, "package.json")
    const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8")
    const packageJson: PackageJson = JSON.parse(packageJsonContent)
    
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    }
    
    return allDependencies && (
      allDependencies.next || 
      allDependencies["@next/next"] ||
      Object.keys(allDependencies).some(dep => dep.startsWith("next"))
    )
  } catch {
    return false
  }
}

async function createNextJsWrapper(appPath: string, appName: string): Promise<void> {
  try {
    console.log(`Creating wrapper for Next.js app: ${appName}`)
    
    // Create an index.html wrapper that provides instructions for running the Next.js app
    const indexPath = path.join(appPath, "index.html")
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName} - Next.js App</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            backdrop-filter: blur(10px);
            max-width: 600px;
        }
        h1 {
            margin-bottom: 1rem;
            font-size: 2rem;
        }
        p {
            margin-bottom: 1.5rem;
            opacity: 0.9;
            line-height: 1.6;
        }
        .code-block {
            background: rgba(0,0,0,0.3);
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 1rem 0;
            font-family: 'Monaco', 'Menlo', monospace;
            text-align: left;
            overflow-x: auto;
        }
        .button {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            border-radius: 0.5rem;
            transition: background 0.3s;
            margin: 0.5rem;
        }
        .button:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        .steps {
            text-align: left;
            margin: 1.5rem 0;
        }
        .steps ol {
            margin: 0;
            padding-left: 1.5rem;
        }
        .steps li {
            margin-bottom: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ${appName}</h1>
        <p>This is a Next.js application that can be run independently.</p>
        
        <div class="steps">
            <h3>To run this app:</h3>
            <ol>
                <li>Open a terminal</li>
                <li>Navigate to the app directory</li>
                <li>Install dependencies (if not already done)</li>
                <li>Start the development server</li>
            </ol>
        </div>
        
        <div class="code-block">
# Navigate to the app directory
cd public/miniapps/${appName}

# Install dependencies (if needed)
npm install

# Start the development server
npm run dev
        </div>
        
        <p>The app will be available at <strong>http://localhost:3000</strong></p>
        
        <div>
            <a href="/" class="button">← Back to Super App</a>
            <button onclick="window.open('http://localhost:3000', '_blank')" class="button">Open App</button>
        </div>
    </div>
</body>
</html>`
    
    await fs.writeFile(indexPath, htmlContent)
    console.log(`Created wrapper for Next.js app ${appName}`)
  } catch (error) {
    console.error(`Failed to create wrapper for Next.js app ${appName}:`, error)
    throw error
  }
}

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

    // Filter for directories and process them
    const apps = []
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const appPath = path.join(miniappsPath, entry.name)
        const indexPath = path.join(appPath, "index.html")
        
        // Check if index.html already exists
        let hasIndexHtml = false
        try {
          await fs.access(indexPath)
          hasIndexHtml = true
        } catch {
          // No index.html found
        }
        
        // If no index.html, check if it's a Next.js app
        if (!hasIndexHtml) {
          const isNextJs = await isNextJsApp(appPath)
          if (isNextJs) {
            try {
              await createNextJsWrapper(appPath, entry.name)
              hasIndexHtml = true
            } catch (error) {
              console.error(`Failed to process Next.js app ${entry.name}:`, error)
              // Continue with other apps even if one fails
            }
          }
        }
        
        if (hasIndexHtml) {
          apps.push(entry.name)
        }
      }
    }

    return NextResponse.json({ apps })
  } catch (error) {
    console.error("Error scanning apps:", error)
    return NextResponse.json({ apps: [] })
  }
}
