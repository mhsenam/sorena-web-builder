'use client'

import { Download, Eye, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportButtonsProps {
  files: any[]
}

export default function ExportButtons({ files }: ExportButtonsProps) {
  async function downloadZip() {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files })
      })
      
      if (!response.ok) {
        throw new Error('Failed to export files')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `website-${Date.now()}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={downloadZip}>
        <Download className="w-4 h-4" />
        Download ZIP
      </Button>
      
      <Button variant="outline" disabled>
        <Eye className="w-4 h-4" />
        Live Preview (Coming Soon)
      </Button>
      
      <Button variant="outline" disabled>
        <Rocket className="w-4 h-4" />
        Deploy to Vercel
      </Button>
    </div>
  )
}