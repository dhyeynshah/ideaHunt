import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for database operations
export const dbHelpers = {
  // Get all approved projects with vote counts
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        users!projects_maker_id_fkey(username, display_name, avatar_url),
        categories(name, slug, color),
        votes(count)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get featured project for today
  async getFeaturedProject() {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('daily_features')
      .select(`
        projects(*,
          users!projects_maker_id_fkey(username, display_name, avatar_url),
          categories(name, slug, color)
        )
      `)
      .eq('featured_date', today)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data?.projects || null
  },

  // Submit a new project
  async submitProject(projectData, userId) {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...projectData,
        maker_id: userId,
        slug: projectData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Vote on a project
  async voteProject(projectId, userId) {
    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .single()
    
    if (existingVote) {
      // Remove vote
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('user_id', userId)
        .eq('project_id', projectId)
      
      if (error) throw error
      
      // Decrease vote count
      const { error: updateError } = await supabase
        .from('projects')
        .update({ votes_count: supabase.raw('votes_count - 1') })
        .eq('id', projectId)
      
      if (updateError) throw updateError
      return { voted: false }
    } else {
      // Add vote
      const { error } = await supabase
        .from('votes')
        .insert([{ user_id: userId, project_id: projectId }])
      
      if (error) throw error
      
      // Increase vote count
      const { error: updateError } = await supabase
        .from('projects')
        .update({ votes_count: supabase.raw('votes_count + 1') })
        .eq('id', projectId)
      
      if (updateError) throw updateError
      return { voted: true }
    }
  },

  // Get user's votes
  async getUserVotes(userId) {
    const { data, error } = await supabase
      .from('votes')
      .select('project_id')
      .eq('user_id', userId)
    
    if (error) throw error
    return data.map(vote => vote.project_id)
  },

  // Get categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  }
}