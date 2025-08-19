"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

interface AppFrameProps {
  appName: string
}

export function AppFrame({ appName }: AppFrameProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  // In production, this would point to your mini apps in public/miniapps/
  const appUrl = `/miniapps/${appName}/`

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading {appName}...</span>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">App Not Found</h3>
            <p className="text-muted-foreground mb-4">
              Could not load {appName}. Make sure the app exists in public/miniapps/{appName}/
            </p>
            <p className="text-sm text-muted-foreground">Expected path: public/miniapps/{appName}/index.html</p>
          </div>
        </div>
      )}

      <iframe
        src={appUrl}
        className="w-full h-full border-0"
        onLoad={handleLoad}
        onError={handleError}
        title={`${appName} Mini App`}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  )
}
