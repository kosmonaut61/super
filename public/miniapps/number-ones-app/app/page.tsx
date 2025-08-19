"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface FlyingOne {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  duration: number
}

export default function Home() {
  const [flyingOnes, setFlyingOnes] = useState<FlyingOne[]>([])

  const launchOnes = () => {
    const newOnes: FlyingOne[] = []

    // Create 8-12 random number 1's
    const count = Math.floor(Math.random() * 5) + 8

    for (let i = 0; i < count; i++) {
      newOnes.push({
        id: Date.now() + i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        rotation: Math.random() * 720 - 360, // Random rotation between -360 and 360
        scale: Math.random() * 0.8 + 0.5, // Scale between 0.5 and 1.3
        duration: Math.random() * 2 + 2, // Duration between 2-4 seconds
      })
    }

    setFlyingOnes((prev) => [...prev, ...newOnes])

    // Remove the ones after their animation completes
    setTimeout(() => {
      setFlyingOnes((prev) => prev.filter((one) => !newOnes.some((newOne) => newOne.id === one.id)))
    }, 4000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center relative overflow-hidden">
      {/* Flying 1's */}
      {flyingOnes.map((one) => (
        <div
          key={one.id}
          className="absolute text-6xl font-bold text-blue-600 dark:text-blue-400 pointer-events-none select-none animate-bounce"
          style={{
            left: `${one.x}px`,
            top: `${one.y}px`,
            transform: `rotate(${one.rotation}deg) scale(${one.scale})`,
            animation: `flyAway ${one.duration}s ease-out forwards, bounce 0.5s ease-in-out infinite`,
          }}
        >
          1
        </div>
      ))}

      {/* Main button */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-gray-200">Number 1 Launcher! 🚀</h1>
        <Button
          onClick={launchOnes}
          size="lg"
          className="text-xl px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Launch 1's!
        </Button>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Click the button to launch playful number 1's across the screen!
        </p>
      </div>

      <style jsx>{`
        @keyframes flyAway {
          0% {
            opacity: 1;
            transform: rotate(0deg) scale(0.5) translateY(0px);
          }
          50% {
            opacity: 1;
            transform: rotate(180deg) scale(1.2) translateY(-100px);
          }
          100% {
            opacity: 0;
            transform: rotate(360deg) scale(0.8) translateY(-200px);
          }
        }
      `}</style>
    </div>
  )
}
