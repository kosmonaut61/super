"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HeaderProps {
  availableApps: string[]
  selectedApp: string
  onAppSelect: (app: string) => void
}

export function Header({ availableApps, selectedApp, onAppSelect }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Super App</h1>
      </div>

      <div className="flex-1 flex justify-center">
        <Select value={selectedApp} onValueChange={onAppSelect}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select an app" />
          </SelectTrigger>
          <SelectContent>
            {availableApps.map((app) => (
              <SelectItem key={app} value={app}>
                {app
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{availableApps.length} apps loaded</span>
      </div>
    </header>
  )
}
