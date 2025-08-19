"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { AppFrame } from "@/components/app-frame"

export default function SuperApp() {
  const [selectedApp, setSelectedApp] = useState<string>("")
  const [availableApps, setAvailableApps] = useState<string[]>([])

  useEffect(() => {
    async function fetchApps() {
      try {
        const response = await fetch("/api/scan-apps")
        const data = await response.json()
        setAvailableApps(data.apps)
        if (data.apps.length > 0) {
          setSelectedApp(data.apps[0])
        }
      } catch (error) {
        console.error("Failed to fetch apps:", error)
        // Fallback to example apps for demo
        const mockApps = ["todo-app", "weather-app", "calculator"]
        setAvailableApps(mockApps)
        setSelectedApp(mockApps[0])
      }
    }

    fetchApps()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header availableApps={availableApps} selectedApp={selectedApp} onAppSelect={setSelectedApp} />
      <main className="h-[calc(100vh-4rem)]">{selectedApp && <AppFrame appName={selectedApp} />}</main>
    </div>
  )
}
