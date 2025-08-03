import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { dbHelpers } from '@/lib/supabase'

// POST /api/projects/[id]/vote - Toggle vote on a project
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.userData?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const projectId = params.id
    const result = await dbHelpers.voteProject(projectId, session.user.userData.id)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error voting on project:', error)
    return NextResponse.json(
      { error: 'Failed to vote on project' },
      { status: 500 }
    )
  }
}