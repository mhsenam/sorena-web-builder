'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import gsap from 'gsap'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const button = document.getElementById('theme-toggle-btn')
    
    gsap.to(button, {
      rotation: 360,
      scale: 0.8,
      duration: 0.3,
      ease: 'power2.inOut',
      onComplete: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
        gsap.to(button, {
          rotation: 0,
          scale: 1,
          duration: 0.3,
          ease: 'back.out(1.7)'
        })
      }
    })
  }

  if (!mounted) return null

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-gray-100 dark:bg-gray-800 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-gray-300" />
      ) : (
        <Moon className="w-5 h-5 text-gray-800" />
      )}
    </button>
  )
}