import { NextRequest, NextResponse } from 'next/server'
import { BuildRequestSchema } from '@/lib/validation'
import { generateSitePlan } from '@/lib/ai'
import { buildFilesFromPlan } from '@/lib/codegen'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = BuildRequestSchema.parse(body)
    
    const plan = await generateSitePlan(validatedData)
    const files = buildFilesFromPlan(plan, validatedData.framework)
    
    return NextResponse.json({ plan, files })
  } catch (error: any) {
    console.error('Generation error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate site' },
      { status: 500 }
    )
  }
}