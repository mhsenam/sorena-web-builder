import { NextRequest, NextResponse } from 'next/server'
import { zipFiles } from '@/lib/zip'
import { GeneratedFilesSchema } from '@/lib/validation'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = GeneratedFilesSchema.parse(body)
    
    const buffer = await zipFiles(validatedData.files)
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="site-${Date.now()}.zip"`
      }
    })
  } catch (error: any) {
    console.error('Export error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Failed to export files' },
      { status: 500 }
    )
  }
}