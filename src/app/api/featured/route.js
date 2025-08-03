import { NextResponse } from 'next/server'
import { dbHelpers } from '@/lib/supabase'

// GET /api/featured - Get today's featured project
export async function GET() {
  try {
    const featuredProject = await dbHelpers.getFeaturedProject()
    return NextResponse.json(featuredProject)
  } catch (error) {
    console.error('Error fetching featured project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured project' },
      { status: 500 }
    )
  }
}