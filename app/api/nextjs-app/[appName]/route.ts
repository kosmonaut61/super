import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: { appName: string } }
) {
  try {
    const appName = params.appName
    const appPath = path.join(process.cwd(), "public", "miniapps", appName)
    const nextOutputPath = path.join(appPath, ".next")
    
    // Check if the Next.js app has been built
    try {
      await fs.access(nextOutputPath)
    } catch {
      return new NextResponse("Next.js app not built", { status: 404 })
    }
    
    // For now, let's serve a simple HTML page that loads the Next.js app
    // In a production environment, you'd want to serve the actual built files
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
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-right: 16px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .message {
            color: #666;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="loading">
        <div class="spinner"></div>
        <div class="message">Loading ${appName}...</div>
    </div>
    <script>
        // For now, we'll show a message about the app being built
        // In a full implementation, you'd load the actual Next.js app here
        setTimeout(() => {
            document.body.innerHTML = \`
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; flex-direction: column;">
                    <h2 style="color: #333; margin-bottom: 16px;">${appName}</h2>
                    <p style="color: #666; text-align: center; max-width: 400px; line-height: 1.5;">
                        This Next.js app has been built and is ready to run. 
                        To see it in action, you can run it independently or 
                        implement a full static file serving solution.
                    </p>
                    <div style="margin-top: 24px;">
                        <button onclick="window.open('http://localhost:3000', '_blank')" 
                                style="background: #0070f3; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; margin: 0 8px;">
                            Open in New Tab
                        </button>
                        <button onclick="window.history.back()" 
                                style="background: #666; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; margin: 0 8px;">
                            Go Back
                        </button>
                    </div>
                </div>
            \`;
        }, 2000);
    </script>
</body>
</html>`
    
    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Error serving Next.js app:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
