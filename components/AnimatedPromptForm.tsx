'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BuildRequest } from '@/lib/validation'
import gsap from 'gsap'

interface AnimatedPromptFormProps {
  onSubmit: (data: BuildRequest) => void
  loading?: boolean
}

export function AnimatedPromptForm({ onSubmit, loading = false }: AnimatedPromptFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  
  const [formData, setFormData] = useState<BuildRequest>({
    intent: '',
    framework: 'vanilla',
    theme: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      font: 'Inter',
      dark: false
    },
    sections: ['hero', 'features'],
    language: 'en',
    brand: {
      name: '',
      tone: 'formal'
    }
  })

  useEffect(() => {
    if (!formRef.current) return

    const cards = cardsRef.current.filter(Boolean)
    
    gsap.set(cards, { opacity: 0, y: 50 })
    
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    })

    const inputs = formRef.current.querySelectorAll('input, textarea, select')
    inputs.forEach((input) => {
      input.addEventListener('focus', () => {
        gsap.to(input, {
          scale: 1.02,
          duration: 0.2,
          ease: 'back.out(1.7)'
        })
      })
      
      input.addEventListener('blur', () => {
        gsap.to(input, {
          scale: 1,
          duration: 0.2,
          ease: 'power2.inOut'
        })
      })
    })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitButton = e.currentTarget.querySelector('button[type="submit"]')
    
    gsap.to(submitButton, {
      scale: 0.95,
      duration: 0.1,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.to(submitButton, {
          scale: 1,
          duration: 0.3,
          ease: 'elastic.out(1, 0.3)'
        })
        onSubmit(formData)
      }
    })
  }

  const handleSectionToggle = (section: string) => {
    const newSections = formData.sections.includes(section as any)
      ? formData.sections.filter(s => s !== section)
      : [...formData.sections, section as any]
    
    setFormData({ ...formData, sections: newSections })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <Card 
        ref={el => { if (el) cardsRef.current[0] = el }}
        className="backdrop-blur-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Describe Your Website
          </CardTitle>
          <CardDescription>
            Tell us what kind of website you want to build
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="E.g., A modern portfolio website for a freelance designer with a minimalist aesthetic..."
            value={formData.intent}
            onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
            className="min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            required
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="technical" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="technical">
          <Card 
            ref={el => { if (el) cardsRef.current[1] = el }}
            className="backdrop-blur-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <CardHeader>
              <CardTitle>Technical Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="framework">Framework</Label>
                <Select
                  value={formData.framework}
                  onValueChange={(value: any) => setFormData({ ...formData, framework: value })}
                >
                  <SelectTrigger className="transition-all duration-200 hover:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vanilla">Vanilla HTML/CSS/JS</SelectItem>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="next">Next.js</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value: any) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger className="transition-all duration-200 hover:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fa">Persian (فارسی)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design">
          <Card 
            ref={el => { if (el) cardsRef.current[2] = el }}
            className="backdrop-blur-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <CardHeader>
              <CardTitle>Design Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.theme.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, primary: e.target.value }
                      })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.theme.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, primary: e.target.value }
                      })}
                      className="flex-1 transition-all duration-200 hover:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.theme.secondary || '#8B5CF6'}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, secondary: e.target.value }
                      })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.theme.secondary || '#8B5CF6'}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, secondary: e.target.value }
                      })}
                      className="flex-1 transition-all duration-200 hover:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Website Sections</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['hero', 'features', 'menu', 'gallery', 'pricing', 'contact', 'faq'].map((section) => (
                    <Button
                      key={section}
                      type="button"
                      variant={formData.sections.includes(section as any) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSectionToggle(section)}
                      className="capitalize transition-all duration-200 hover:scale-105"
                    >
                      {section}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card 
            ref={el => { if (el) cardsRef.current[3] = el }}
            className="backdrop-blur-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  value={formData.brand?.name || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    brand: { ...formData.brand, name: e.target.value }
                  })}
                  placeholder="Your Company Name"
                  className="transition-all duration-200 hover:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Brand Tone</Label>
                <Select
                  value={formData.brand?.tone || 'formal'}
                  onValueChange={(value: any) => setFormData({
                    ...formData,
                    brand: { ...formData.brand, tone: value }
                  })}
                >
                  <SelectTrigger className="transition-all duration-200 hover:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="playful">Playful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button 
        type="submit" 
        disabled={loading || !formData.intent}
        className="w-full h-12 text-lg font-semibold bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            Generating...
          </span>
        ) : (
          'Generate Website'
        )}
      </Button>
    </form>
  )
}