import { NextResponse } from 'next/server'
import { dbHelpers } from '@/lib/supabase'

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const categories = await dbHelpers.getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}