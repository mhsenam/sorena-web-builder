'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    const dots = dotsRef.current
    
    dots.forEach((dot, index) => {
      if (!dot) return
      
      gsap.set(dot, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        opacity: Math.random() * 0.3 + 0.1,
        scale: Math.random() * 0.5 + 0.5
      })

      const tl = gsap.timeline({ repeat: -1 })
      
      tl.to(dot, {
        x: `+=${Math.random() * 200 - 100}`,
        y: `+=${Math.random() * 200 - 100}`,
        duration: Math.random() * 20 + 10,
        ease: 'none'
      })
      .to(dot, {
        x: `+=${Math.random() * 200 - 100}`,
        y: `+=${Math.random() * 200 - 100}`,
        duration: Math.random() * 20 + 10,
        ease: 'none'
      })
      .to(dot, {
        x: `+=${Math.random() * 200 - 100}`,
        y: `+=${Math.random() * 200 - 100}`,
        duration: Math.random() * 20 + 10,
        ease: 'none'
      })
    })

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      dots.forEach((dot, index) => {
        if (!dot) return
        const speed = (index + 1) * 0.01
        gsap.to(dot, {
          x: `+=${(clientX - window.innerWidth / 2) * speed}`,
          y: `+=${(clientY - window.innerHeight / 2) * speed}`,
          duration: 1,
          ease: 'power2.out'
        })
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      gsap.killTweensOf(dots)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          ref={el => {
            if (el) dotsRef.current[i] = el
          }}
          className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-gray-400/20 to-gray-600/20 dark:from-gray-500/10 dark:to-gray-700/10"
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-500/5 dark:to-gray-400/5" />
    </div>
  )
}