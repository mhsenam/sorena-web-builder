'use client'

import { useState } from 'react'

interface PromptFormProps {
  onResult: (data: any) => void
}

export default function PromptForm({ onResult }: PromptFormProps) {
  const [loading, setLoading] = useState(false)
  const [intent, setIntent] = useState('')
  const [framework, setFramework] = useState<'vanilla' | 'react' | 'next'>('next')
  const [language, setLanguage] = useState<'fa' | 'en'>('en')
  const [sections, setSections] = useState<string[]>(['hero', 'features', 'contact'])
  const [primaryColor, setPrimaryColor] = useState('#7c3aed')

  const availableSections = [
    { value: 'hero', label: 'Hero Section' },
    { value: 'features', label: 'Features' },
    { value: 'menu', label: 'Menu' },
    { value: 'gallery', label: 'Gallery' },
    { value: 'pricing', label: 'Pricing' },
    { value: 'contact', label: 'Contact' },
    { value: 'faq', label: 'FAQ' }
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!intent.trim()) {
      alert('Please enter a description for your website')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          framework,
          theme: { 
            primary: primaryColor, 
            dark: false 
          },
          sections,
          language,
          brand: { tone: 'casual' }
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate site')
      }
      
      onResult(data)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  function toggleSection(section: string) {
    setSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="intent" className="block text-sm font-medium mb-2">
          Describe your website
        </label>
        <textarea
          id="intent"
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={4}
          placeholder="E.g., A modern portfolio website for a photographer with gallery and contact form"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="framework" className="block text-sm font-medium mb-2">
            Framework
          </label>
          <select
            id="framework"
            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
            value={framework}
            onChange={(e) => setFramework(e.target.value as any)}
            disabled={loading}
          >
            <option value="next">Next.js</option>
            <option value="react">React</option>
            <option value="vanilla">HTML/CSS/JS</option>
          </select>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium mb-2">
            Content Language
          </label>
          <select
            id="language"
            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            disabled={loading}
          >
            <option value="en">English</option>
            <option value="fa">Persian (فارسی)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium mb-2">
          Primary Color
        </label>
        <div className="flex gap-2">
          <input
            id="color"
            type="color"
            className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            disabled={loading}
          />
          <input
            type="text"
            className="flex-1 border border-gray-300 p-2 rounded-lg"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Sections
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {availableSections.map(section => (
            <label
              key={section.value}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={sections.includes(section.value)}
                onChange={() => toggleSection(section.value)}
                disabled={loading}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm">{section.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !sections.length}
        className="w-full px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Generating...' : 'Generate Website'}
      </button>
    </form>
  )
}