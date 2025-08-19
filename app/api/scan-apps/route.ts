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
    
    return Boolean(allDependencies && (
      allDependencies.next || 
      allDependencies["@next/next"] ||
      Object.keys(allDependencies).some(dep => dep.startsWith("next"))
    ))
  } catch {
    return false
  }
}

async function createNextJsIframeWrapper(appPath: string, appName: string): Promise<void> {
  try {
    console.log(`Creating iframe wrapper for Next.js app: ${appName}`)
    
    // Create an index.html wrapper that loads the Next.js app in an iframe
    const indexPath = path.join(appPath, "index.html")
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName}</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
        }
        .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        .header {
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        .controls {
            display: flex;
            gap: 8px;
        }
        .btn {
            background: #0070f3;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            text-decoration: none;
            display: inline-block;
        }
        .btn:hover {
            background: #0051cc;
        }
        .btn.secondary {
            background: #6c757d;
        }
        .btn.secondary:hover {
            background: #5a6268;
        }
        .btn.success {
            background: #28a745;
        }
        .btn.success:hover {
            background: #218838;
        }
        .iframe-container {
            flex: 1;
            position: relative;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        .loading {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #f8f9fa;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #666;
            text-align: center;
            padding: 20px;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #0070f3;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .instructions {
            max-width: 500px;
            line-height: 1.6;
        }
        .code-block {
            background: #f1f3f4;
            padding: 12px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            margin: 16px 0;
            text-align: left;
        }
        .status {
            margin-top: 16px;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">🚀 ${appName}</div>
            <div class="controls">
                <button class="btn" onclick="checkAndLoadApp()">Load App</button>
                <button class="btn secondary" onclick="showInstructions()">Instructions</button>
                <a href="/" class="btn secondary">← Back to Super App</a>
            </div>
        </div>
        <div class="iframe-container">
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <div class="instructions">
                    <h3>${appName} - Next.js App</h3>
                    <p>To run this app in the iframe, you need to start its development server first.</p>
                    <div class="code-block">
# Open a terminal and run:
cd public/miniapps/${appName}
npm install
npm run dev
                    </div>
                    <p>The app will be available at <strong>http://localhost:3000</strong></p>
                    <p>Once the server is running, click "Load App" to display it in the iframe.</p>
                </div>
            </div>
            <iframe id="app-iframe" style="display: none;" onload="hideLoading()" onerror="showError()"></iframe>
        </div>
    </div>
    
    <script>
        function showInstructions() {
            const loading = document.getElementById('loading');
            loading.innerHTML = \`
                <div class="spinner"></div>
                <div class="instructions">
                    <h3>How to run ${appName}</h3>
                    <p>This is a Next.js application that needs to be run independently.</p>
                    <div class="code-block">
# 1. Open a terminal
# 2. Navigate to the app directory:
cd public/miniapps/${appName}

# 3. Install dependencies (if not already done):
npm install

# 4. Start the development server:
npm run dev
                    </div>
                    <p>The app will be available at <strong>http://localhost:3000</strong></p>
                    <p>Once the server is running, click "Load App" to display it in the iframe.</p>
                    <div class="status success">
                        ✅ The app will automatically reload when you make changes
                    </div>
                </div>
            \`;
        }
        
        function checkAndLoadApp() {
            const loading = document.getElementById('loading');
            const iframe = document.getElementById('app-iframe');
            
            loading.innerHTML = \`
                <div class="spinner"></div>
                <div>Checking if ${appName} is running...</div>
            \`;
            
            // Try to load the app in the iframe
            iframe.src = 'http://localhost:3000';
            iframe.style.display = 'block';
            
            // Set a timeout to show error if the app doesn't load
            setTimeout(() => {
                if (iframe.style.display !== 'none') {
                    loading.innerHTML = \`
                        <div class="spinner"></div>
                        <div class="instructions">
                            <h3>App not found</h3>
                            <p>The development server for ${appName} doesn't seem to be running.</p>
                            <div class="status error">
                                ❌ Make sure you've started the dev server with: npm run dev
                            </div>
                            <p>Check that the server is running on http://localhost:3000</p>
                            <button class="btn" onclick="checkAndLoadApp()">Try Again</button>
                        </div>
                    \`;
                    iframe.style.display = 'none';
                }
            }, 5000);
        }
        
        function hideLoading() {
            const loading = document.getElementById('loading');
            loading.style.display = 'none';
        }
        
        function showError() {
            const loading = document.getElementById('loading');
            loading.innerHTML = \`
                <div class="instructions">
                    <h3>Connection Error</h3>
                    <p>Could not connect to ${appName}.</p>
                    <div class="status error">
                        ❌ Make sure the development server is running
                    </div>
                    <button class="btn" onclick="checkAndLoadApp()">Try Again</button>
                </div>
            \`;
            loading.style.display = 'flex';
        }
    </script>
</body>
</html>`
    
    await fs.writeFile(indexPath, htmlContent)
    console.log(`Created iframe wrapper for Next.js app ${appName}`)
  } catch (error) {
    console.error(`Failed to create iframe wrapper for Next.js app ${appName}:`, error)
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
              await createNextJsIframeWrapper(appPath, entry.name)
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
