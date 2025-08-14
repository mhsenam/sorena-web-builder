'use client'

import { useState, useEffect } from 'react'

interface LivePreviewProps {
  initial?: any
}

export default function LivePreview({ initial }: LivePreviewProps) {
  const [data, setData] = useState<any>(initial)
  
  useEffect(() => {
    if (initial) {
      setData(initial)
    }
  }, [initial])

  if (!data || !data.plan) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-4 text-gray-500">Your website preview will appear here after generation</p>
      </div>
    )
  }

  const { plan } = data

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{plan.meta?.title || 'Preview'}</span>
          <div className="w-20"></div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-900 h-[600px] overflow-hidden">
        {/* Render actual HTML if available */}
        {data.files?.files?.find((f: any) => f.path.endsWith('.html')) ? (
          <iframe
            srcDoc={data.files.files.find((f: any) => f.path.endsWith('.html'))?.content || ''}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-forms allow-modals allow-popups"
          />
        ) : (
          <div className="p-6 space-y-6 h-full overflow-y-auto">
            {/* Fallback to section preview */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">{plan.meta?.title}</h1>
              <p className="text-gray-600">{plan.meta?.description}</p>
            </div>

            {plan.sections?.map((section: any) => (
              <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 rounded">
                    {section.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">#{section.id}</span>
                </div>
                
                {renderSectionPreview(section)}
              </div>
            ))}

            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Style Configuration</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(plan.style?.colors || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: value as string }}
                    ></div>
                    <span className="text-gray-600 dark:text-gray-400">{key}: {value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function renderSectionPreview(section: any) {
  switch(section.type) {
    case 'hero':
      return (
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold mb-2">{section.props.title || 'Hero Title'}</h2>
          <p className="text-gray-600 mb-4">{section.props.subtitle || 'Hero subtitle'}</p>
          {section.props.cta && (
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
              {section.props.cta}
            </button>
          )}
        </div>
      )
    
    case 'features':
      return (
        <div>
          <h3 className="text-xl font-semibold mb-3">{section.props.title || 'Features'}</h3>
          <div className="grid grid-cols-2 gap-3">
            {(section.props.items || []).slice(0, 4).map((item: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 rounded">
                <h4 className="font-medium">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )
    
    case 'contact':
      return (
        <div>
          <h3 className="text-xl font-semibold mb-3">{section.props.title || 'Contact'}</h3>
          <div className="space-y-2 text-sm">
            {section.props.email && <p>📧 {section.props.email}</p>}
            {section.props.phone && <p>📱 {section.props.phone}</p>}
            {section.props.address && <p>📍 {section.props.address}</p>}
          </div>
        </div>
      )
    
    default:
      return (
        <div className="bg-gray-50 p-3 rounded">
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(section.props, null, 2)}
          </pre>
        </div>
      )
  }
}