'use client'

import { useState, useEffect } from 'react'
import { Monitor, Smartphone, Tablet, Code2, Eye, Copy, Check, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ModernLivePreviewProps {
  initial?: any
}

export default function ModernLivePreview({ initial }: ModernLivePreviewProps) {
  const [data, setData] = useState<any>(initial)
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  
  useEffect(() => {
    if (initial) {
      setData(initial)
    }
  }, [initial])

  const viewModes = [
    { mode: 'desktop', icon: Monitor, width: '100%' },
    { mode: 'tablet', icon: Tablet, width: '768px' },
    { mode: 'mobile', icon: Smartphone, width: '375px' }
  ]

  const copyToClipboard = () => {
    if (data?.plan) {
      navigator.clipboard.writeText(JSON.stringify(data.plan, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!data || !data.plan) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <Eye className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="mb-3 text-2xl font-semibold">
          Ready to Preview
        </h3>
        <p className="text-muted-foreground">
          Your website preview will appear here after generation
        </p>
      </div>
    )
  }

  const { plan } = data

  return (
    <div className="space-y-6">
      {/* Preview Controls */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          {viewModes.map(({ mode, icon: Icon }) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode(mode as any)}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showCode ? "default" : "ghost"}
            size="icon"
            onClick={() => setShowCode(!showCode)}
          >
            <Code2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Preview Window */}
      {showCode ? (
        <div className="rounded-lg border bg-card p-6">
          <pre className="overflow-x-auto text-xs">
            <code className="language-json">
              {JSON.stringify(plan, null, 2)}
            </code>
          </pre>
        </div>
      ) : (
        <div 
          className="rounded-lg border bg-card overflow-hidden transition-all duration-300"
          style={{ 
            maxWidth: viewModes.find(m => m.mode === viewMode)?.width,
            margin: '0 auto'
          }}
        >
          {/* Browser Chrome */}
          <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 text-center">
              <div className="inline-block rounded-lg bg-background/50 px-3 py-1 text-xs">
                {plan.meta?.title || 'Preview'}
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="max-h-[600px] overflow-y-auto">
            {/* Render actual HTML if available */}
            {data.files?.files?.find((f: any) => f.path.endsWith('.html')) ? (
              <iframe
                srcDoc={data.files.files.find((f: any) => f.path.endsWith('.html'))?.content || ''}
                className="w-full h-[500px] border-0"
                sandbox="allow-scripts allow-forms allow-modals allow-popups"
              />
            ) : (
              <div className="p-6">
                {/* Fallback to section preview */}
                <div className="mb-12 text-center">
                  <h1 className="mb-4 text-4xl font-bold">
                    {plan.meta?.title}
                  </h1>
                  <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                    {plan.meta?.description}
                  </p>
                </div>

                {/* Sections */}
                {plan.sections?.map((section: any) => (
                  <div
                    key={section.id}
                    className="mb-8"
                  >
                    <div className="rounded-lg border bg-card p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          {section.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          #{section.id}
                        </span>
                      </div>
                      
                      {renderSectionPreview(section)}
                    </div>
                  </div>
                ))}

                {/* Style Info */}
                <div className="mt-8">
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-4 text-sm font-semibold">Design System</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {Object.entries(plan.style?.colors || {}).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div 
                            className="mb-2 h-20 w-full rounded-lg shadow-inner"
                            style={{ backgroundColor: value as string }}
                          />
                          <p className="text-xs font-medium">{key}</p>
                          <p className="text-xs text-muted-foreground">{value as string}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function renderSectionPreview(section: any) {
  switch(section.type) {
    case 'hero':
      return (
        <div className="py-8 text-center">
          <h2 className="mb-3 text-3xl font-bold">{section.props.title || 'Hero Title'}</h2>
          <p className="mb-6 text-muted-foreground">{section.props.subtitle || 'Hero subtitle'}</p>
          {section.props.cta && (
            <Button>
              {section.props.cta}
            </Button>
          )}
        </div>
      )
    
    case 'features':
      return (
        <div>
          <h3 className="mb-6 text-2xl font-semibold">{section.props.title || 'Features'}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(section.props.items || []).slice(0, 4).map((item: any, idx: number) => (
              <div 
                key={idx} 
                className="rounded-lg bg-muted/50 p-4"
              >
                <h4 className="mb-2 font-semibold">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )
    
    case 'contact':
      return (
        <div>
          <h3 className="mb-6 text-2xl font-semibold">{section.props.title || 'Contact'}</h3>
          <div className="space-y-3">
            {section.props.email && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Mail className="h-5 w-5" />
                </div>
                <span>{section.props.email}</span>
              </div>
            )}
            {section.props.phone && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Phone className="h-5 w-5" />
                </div>
                <span>{section.props.phone}</span>
              </div>
            )}
            {section.props.address && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <MapPin className="h-5 w-5" />
                </div>
                <span>{section.props.address}</span>
              </div>
            )}
          </div>
        </div>
      )
    
    default:
      return (
        <div className="rounded-lg bg-muted/50 p-4">
          <pre className="overflow-x-auto text-xs">
            {JSON.stringify(section.props, null, 2)}
          </pre>
        </div>
      )
  }
}