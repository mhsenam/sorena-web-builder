'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Monitor, Smartphone, Tablet } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LivePreviewProps {
  initial?: any
}

type ViewMode = 'desktop' | 'tablet' | 'mobile'

export default function LivePreview({ initial }: LivePreviewProps) {
  const [data, setData] = useState<any>(initial)
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  
  useEffect(() => {
    if (initial) {
      setData(initial)
    }
  }, [initial])

  if (!data || !data.plan) {
    return (
      <Card className="border-2 border-dashed bg-background/50">
        <CardContent className="p-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No Preview Available</p>
            <p className="text-muted-foreground">Your website preview will appear here after generation</p>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  const { plan } = data

  // Get the HTML file content
  const htmlFile = data.files?.files?.find((f: any) => f.path === 'index.html' || f.path.endsWith('.html'));
  
  // Get CSS content if available
  const cssFile = data.files?.files?.find((f: any) => f.path === 'styles.css' || f.path.endsWith('.css'));
  
  // Get JS content if available  
  const jsFile = data.files?.files?.find((f: any) => f.path === 'script.js' || f.path.endsWith('.js'));
  
  // Combine HTML with CSS and JS inline for proper rendering
  const renderHtml = () => {
    if (!htmlFile) return '';
    
    let htmlContent = htmlFile.content;
    
    // Inject CSS inline if it exists
    if (cssFile && !htmlContent.includes('<style>')) {
      const styleTag = `<style>${cssFile.content}</style>`;
      htmlContent = htmlContent.replace('</head>', `${styleTag}</head>`);
    }
    
    // Inject JS inline if it exists
    if (jsFile && !htmlContent.includes('<script>')) {
      const scriptTag = `<script>${jsFile.content}</script>`;
      htmlContent = htmlContent.replace('</body>', `${scriptTag}</body>`);
    }
    
    return htmlContent;
  };

  const viewModeConfig = {
    desktop: { width: '100%', label: 'Desktop', icon: Monitor },
    tablet: { width: '768px', label: 'Tablet', icon: Tablet },
    mobile: { width: '375px', label: 'Mobile', icon: Smartphone }
  }

  return (
    <div className="space-y-4">
      {/* View Mode Selector */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {(Object.keys(viewModeConfig) as ViewMode[]).map((mode) => {
            const Icon = viewModeConfig[mode].icon
            return (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{viewModeConfig[mode].label}</span>
              </Button>
            )
          })}
        </div>
        <Badge variant="secondary">
          {plan.meta?.title || 'Preview'}
        </Badge>
      </div>

      {/* Preview Container */}
      <motion.div 
        className="rounded-lg overflow-hidden shadow-2xl border bg-background"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Browser Chrome */}
        <div className="bg-muted px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div 
              className="w-3 h-3 rounded-full bg-red-500"
              whileHover={{ scale: 1.2 }}
            />
            <motion.div 
              className="w-3 h-3 rounded-full bg-yellow-500"
              whileHover={{ scale: 1.2 }}
            />
            <motion.div 
              className="w-3 h-3 rounded-full bg-green-500"
              whileHover={{ scale: 1.2 }}
            />
          </div>
          <div className="flex-1 max-w-md mx-4">
            <div className="bg-background/50 rounded px-3 py-1 text-xs text-muted-foreground">
              localhost:3000/{plan.meta?.title?.toLowerCase().replace(/\s+/g, '-') || 'preview'}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {viewModeConfig[viewMode].width}
          </div>
        </div>
        
        {/* Preview Content */}
        <div className="bg-muted/20 p-4 flex justify-center">
          <motion.div 
            className={cn(
              "bg-white transition-all duration-300",
              viewMode === 'mobile' && "rounded-lg shadow-xl",
              viewMode === 'tablet' && "rounded-lg shadow-xl"
            )}
            style={{ 
              width: viewModeConfig[viewMode].width,
              maxWidth: '100%'
            }}
            layout
          >
            <div className="h-[600px] overflow-hidden">
              {/* Render actual HTML if available */}
              {htmlFile ? (
                <iframe
                  srcDoc={renderHtml()}
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
                  title="Website Preview"
                />
              ) : (
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {/* Fallback to section preview */}
                    <motion.div 
                      className="text-center mb-8"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h1 className="text-3xl font-bold mb-2 text-foreground">{plan.meta?.title}</h1>
                      <p className="text-muted-foreground">{plan.meta?.description}</p>
                    </motion.div>

                    {plan.sections?.map((section: any, index: number) => (
                      <motion.div 
                        key={section.id} 
                        className="border rounded-lg p-4 bg-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="default">
                            {section.type.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">#{section.id}</span>
                        </div>
                        
                        {renderSectionPreview(section)}
                      </motion.div>
                    ))}

                    <Card className="mt-8">
                      <CardContent className="p-4">
                        <h3 className="text-sm font-semibold mb-3">Style Configuration</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(plan.style?.colors || {}).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: value as string }}
                              />
                              <span className="text-sm text-muted-foreground">
                                {key}: {value as string}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

function renderSectionPreview(section: any) {
  switch(section.type) {
    case 'hero':
      return (
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold mb-2 text-foreground">{section.props.title || 'Hero Title'}</h2>
          <p className="text-muted-foreground mb-4">{section.props.subtitle || 'Hero subtitle'}</p>
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
          <h3 className="text-xl font-semibold mb-3 text-foreground">{section.props.title || 'Features'}</h3>
          <div className="grid grid-cols-2 gap-3">
            {(section.props.items || []).slice(0, 4).map((item: any, idx: number) => (
              <Card key={idx}>
                <CardContent className="p-3">
                  <h4 className="font-medium text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    
    case 'contact':
      return (
        <div>
          <h3 className="text-xl font-semibold mb-3 text-foreground">{section.props.title || 'Contact'}</h3>
          <div className="space-y-2 text-sm">
            {section.props.email && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Email</Badge>
                <span className="text-muted-foreground">{section.props.email}</span>
              </div>
            )}
            {section.props.phone && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Phone</Badge>
                <span className="text-muted-foreground">{section.props.phone}</span>
              </div>
            )}
            {section.props.address && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Address</Badge>
                <span className="text-muted-foreground">{section.props.address}</span>
              </div>
            )}
          </div>
        </div>
      )
    
    default:
      return (
        <Card>
          <CardContent className="p-3">
            <pre className="text-xs overflow-x-auto text-muted-foreground">
              {JSON.stringify(section.props, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )
  }
}