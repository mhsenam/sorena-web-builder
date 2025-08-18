'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Loader2, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModernPromptFormProps {
  onResult: (data: any) => void
}

export default function ModernPromptForm({ onResult }: ModernPromptFormProps) {
  const [loading, setLoading] = useState(false)
  const [intent, setIntent] = useState('')
  const [framework, setFramework] = useState<'vanilla' | 'react' | 'next'>('next')
  const [language, setLanguage] = useState<'fa' | 'en'>('en')
  const [sections, setSections] = useState<string[]>(['hero', 'features', 'contact'])
  const [primaryColor, setPrimaryColor] = useState('#000000')

  const frameworks = [
    { value: 'next', label: 'Next.js' },
    { value: 'react', label: 'React' },
    { value: 'vanilla', label: 'HTML/CSS' }
  ]

  const availableSections = [
    { value: 'hero', label: 'Hero' },
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
          brand: { tone: 'modern' }
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
      {/* Intent Input */}
      <div className="space-y-2">
        <Label htmlFor="intent">Website Description</Label>
        <Textarea
          id="intent"
          placeholder="Describe your website (e.g., A modern portfolio for a photographer...)"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          disabled={loading}
          className="min-h-[100px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {intent.length}/1000 characters
        </p>
      </div>

      {/* Framework Selection */}
      <div className="space-y-2">
        <Label>Framework</Label>
        <div className="grid grid-cols-3 gap-3">
          {frameworks.map((fw) => (
            <Button
              key={fw.value}
              type="button"
              variant={framework === fw.value ? "default" : "outline"}
              onClick={() => setFramework(fw.value as any)}
              disabled={loading}
              className="w-full"
            >
              {fw.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Language and Color */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            disabled={loading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="en">English</option>
            <option value="fa">Persian (فارسی)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Primary Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              id="color"
              className="w-14 h-10 p-1 cursor-pointer"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              disabled={loading}
            />
            <Input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        <Label>Website Sections</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {availableSections.map((section) => (
            <Button
              key={section.value}
              type="button"
              variant={sections.includes(section.value) ? "default" : "outline"}
              onClick={() => toggleSection(section.value)}
              disabled={loading}
              size="sm"
              className="w-full"
            >
              {section.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || !sections.length || !intent.trim()}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Generate Website
          </>
        )}
      </Button>
    </form>
  )
}