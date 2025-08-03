'use client'

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from 'next-auth/react'
import { ArrowUp, MessageCircle, ExternalLink, Plus, Search, Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProjectSubmissionModal from "@/components/ProjectSubmissionModal"

export default function Component() {
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState([])
  const [featuredProject, setFeaturedProject] = useState(null)
  const [userVotes, setUserVotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchData()
  }, [session])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch projects
      const projectsResponse = await fetch('/api/projects')
      const projectsData = await projectsResponse.json()
      setProjects(projectsData || [])

      // Fetch featured project
      const featuredResponse = await fetch('/api/featured')
      const featuredData = await featuredResponse.json()
      setFeaturedProject(featuredData)

      // Fetch user votes if logged in
      if (session?.user?.userData?.id) {
        // This would be implemented in a separate API route
        // For now we'll track votes locally
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (projectId) => {
    if (!session) {
      alert('Please sign in to vote')
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/vote`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Update local state
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === projectId 
              ? { 
                  ...project, 
                  votes_count: result.voted 
                    ? project.votes_count + 1 
                    : project.votes_count - 1
                }
              : project
          )
        )

        setUserVotes(prev => 
          result.voted 
            ? [...prev, projectId]
            : prev.filter(id => id !== projectId)
        )
      }
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to vote')
    }
  }

  const handleProjectSubmit = (newProject) => {
    // Refresh the projects list
    fetchData()
    alert('Project submitted! It will be reviewed and appear once approved.')
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">HC</span>
          </div>
          <p className="text-gray-600">Loading awesome projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">HC</span>
                </div>
                <span className="text-xl font-bold text-gray-900">YSWS Hunt</span>
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200" 
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {session && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:flex bg-transparent"
                  onClick={() => setShowSubmissionModal(true)}
                >
                <Plus className="w-4 h-4 mr-2" />
                Submit
              </Button>
              )}
              
              {session ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {session.user.image && (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700 hidden md:block">
                      {session.user.name}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => signOut()}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => signIn('slack')}
                >
                Sign In
              </Button>
              )}
              
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover amazing projects from teenage hackers
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The best place to find and share incredible creations from the Hack Club community
          </p>
          {session ? (
          <div className="flex justify-center">
              <Button 
                size="lg" 
                className="bg-red-500 hover:bg-red-600"
                onClick={() => setShowSubmissionModal(true)}
              >
              <Plus className="w-5 h-5 mr-2" />
              Submit Your Project
            </Button>
          </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-2">Ready to ship? 🚢</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sign in with Slack to submit your projects and participate in YSWS!
              </p>
              <Button 
                size="sm" 
                className="bg-red-500 hover:bg-red-600"
                onClick={() => signIn('slack')}
              >
                Sign In with Slack
              </Button>
            </div>
          )}
        </div>

        {/* Featured Project */}
        {featuredProject && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🏆 Featured Today</h2>
            <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-2xl">
                      {featuredProject.title.charAt(0)}
                    </span>
                  </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {featuredProject.title}
                        </h3>
                        <p className="text-gray-600 mb-2">{featuredProject.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>by {featuredProject.users?.display_name || featuredProject.users?.username}</span>
                          {featuredProject.categories && (
                            <Badge variant="secondary" style={{backgroundColor: featuredProject.categories.color + '20'}}>
                              {featuredProject.categories.name}
                            </Badge>
                          )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                          <span>{featuredProject.comments_count || 0}</span>
                          </Button>
                          <Button
                            size="sm"
                          className={`flex items-center space-x-1 ${
                            userVotes.includes(featuredProject.id) 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-red-500 hover:bg-red-600'
                          }`}
                          onClick={() => handleVote(featuredProject.id)}
                        >
                            <ArrowUp className="w-4 h-4" />
                          <span>{featuredProject.votes_count || 0}</span>
                        </Button>
                        {featuredProject.demo_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(featuredProject.demo_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
        </div>
        )}

        {/* Projects List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {searchTerm ? `Search Results (${filteredProjects.length})` : 'Latest Projects'}
          </h2>
          
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms or browse all projects.'
                  : 'Be the first to submit an awesome project!'}
              </p>
              {session && !searchTerm && (
                <Button 
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => setShowSubmissionModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit First Project
                </Button>
              )}
            </div>
          ) : (
          <div className="space-y-4">
              {filteredProjects.map((project, index) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Rank */}
                      <div className="flex-shrink-0 w-8 text-center">
                        <span className="text-2xl font-bold text-gray-400">
                          {featuredProject ? index + 2 : index + 1}
                        </span>
                      </div>

                      {/* Project Avatar */}
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 font-bold">
                          {project.title.charAt(0)}
                        </span>
                      </div>

                      {/* Project Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-red-600 cursor-pointer">
                              {project.title}
                            </h3>
                            <p className="text-gray-600 mb-2">{project.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>by {project.users?.display_name || project.users?.username}</span>
                              {project.categories && (
                                <Badge 
                                  variant="outline"
                                  style={{backgroundColor: project.categories.color + '20'}}
                                >
                                  {project.categories.name}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{project.comments_count || 0}</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`flex items-center space-x-1 ${
                                userVotes.includes(project.id)
                                  ? 'bg-red-50 border-red-200 text-red-600'
                                  : 'hover:bg-red-50 hover:border-red-200'
                              } bg-transparent`}
                              onClick={() => handleVote(project.id)}
                              disabled={!session}
                            >
                              <ArrowUp className="w-4 h-4" />
                              <span>{project.votes_count || 0}</span>
                            </Button>
                            {project.demo_url && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(project.demo_url, '_blank')}
                              >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
          )}
        </div>
      </main>

      {/* Project Submission Modal */}
      <ProjectSubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        onSubmit={handleProjectSubmit}
      />
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">HC</span>
                </div>
                <span className="font-bold text-gray-900">YSWS Hunt</span>
              </div>
              <p className="text-gray-600 text-sm">
                You Ship, We Ship! Discover and share amazing projects from teenage hackers worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-red-600">
                    Browse Projects
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-600" onClick={() => session && setShowSubmissionModal(true)}>
                    Submit Project
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-600">
                    How YSWS Works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Community</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="https://hackclub.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-600">
                    Hack Club
                  </a>
                </li>
                <li>
                  <a href="https://hackclub.com/slack" target="_blank" rel="noopener noreferrer" className="hover:text-red-600">
                    Join Slack
                  </a>
                </li>
                <li>
                  <a href="https://github.com/hackclub" target="_blank" rel="noopener noreferrer" className="hover:text-red-600">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="https://hackclub.com/ship" target="_blank" rel="noopener noreferrer" className="hover:text-red-600">
                    Ship Gallery
                  </a>
                </li>
                <li>
                  <a href="https://workshops.hackclub.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-600">
                    Workshops
                  </a>
                </li>
                <li>
                  <a href="https://hackclub.com/philosophy" target="_blank" rel="noopener noreferrer" className="hover:text-red-600">
                    Philosophy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 YSWS Hunt. Made with ❤️ by the Hack Club community. 🚢</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
