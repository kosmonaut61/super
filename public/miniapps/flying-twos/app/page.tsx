"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface FlyingTwo {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  velocityX: number
  velocityY: number
}

export default function FlyingTwosApp() {
  const [twos, setTwos] = useState<FlyingTwo[]>([])

  const launchTwos = () => {
    const newTwos: FlyingTwo[] = []

    // Create 8-12 random 2's
    const count = Math.floor(Math.random() * 5) + 8

    for (let i = 0; i < count; i++) {
      newTwos.push({
        id: Date.now() + i,
        x: Math.random() * (window.innerWidth - 100),
        y: Math.random() * (window.innerHeight - 100),
        rotation: Math.random() * 360,
        scale: Math.random() * 0.8 + 0.6,
        velocityX: (Math.random() - 0.5) * 400,
        velocityY: (Math.random() - 0.5) * 400,
      })
    }

    setTwos((prev) => [...prev, ...newTwos])

    // Remove the 2's after animation completes
    setTimeout(() => {
      setTwos((prev) => prev.filter((two) => !newTwos.some((newTwo) => newTwo.id === two.id)))
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center relative overflow-hidden">
      <Button
        onClick={launchTwos}
        size="lg"
        className="text-2xl px-12 py-6 z-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        Launch 2's!
      </Button>

      {/* Flying 2's */}
      {twos.map((two) => (
        <div
          key={two.id}
          className="absolute text-8xl font-black text-blue-500 dark:text-blue-400 pointer-events-none animate-fly-and-spin select-none"
          style={
            {
              left: two.x,
              top: two.y,
              transform: `rotate(${two.rotation}deg) scale(${two.scale})`,
              "--velocity-x": `${two.velocityX}px`,
              "--velocity-y": `${two.velocityY}px`,
              "--rotation": `${two.rotation + 720}deg`,
            } as React.CSSProperties & { [key: string]: string }
          }
        >
          2
        </div>
      ))}
    </div>
  )
}
