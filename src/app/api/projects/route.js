import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { dbHelpers } from '@/lib/supabase'

// GET /api/projects - Get all approved projects
export async function GET() {
  try {
    const projects = await dbHelpers.getProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Submit a new project
export async function POST(request) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.userData?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, long_description, demo_url, github_url, category_id, gallery_urls } = body

    // Validation
    if (!title || !description || !demo_url) {
      return NextResponse.json(
        { error: 'Title, description, and demo URL are required' },
        { status: 400 }
      )
    }

    const project = await dbHelpers.submitProject({
      title,
      description,
      long_description,
      demo_url,
      github_url,
      category_id,
      gallery_urls: gallery_urls || []
    }, session.user.userData.id)

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}