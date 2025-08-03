'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Upload, Link, Github } from 'lucide-react'

export default function ProjectSubmissionModal({ isOpen, onClose, onSubmit }) {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    long_description: '',
    demo_url: '',
    github_url: '',
    category_id: '',
    gallery_urls: []
  })
  const [categories, setCategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.demo_url.trim()) newErrors.demo_url = 'Demo URL is required'
    if (!formData.category_id) newErrors.category_id = 'Category is required'
    
    // URL validation
    try {
      new URL(formData.demo_url)
    } catch {
      newErrors.demo_url = 'Please enter a valid URL'
    }
    
    if (formData.github_url && formData.github_url.trim()) {
      try {
        new URL(formData.github_url)
      } catch {
        newErrors.github_url = 'Please enter a valid GitHub URL'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (!session) {
      alert('Please sign in to submit a project')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const project = await response.json()
        onSubmit(project)
        resetForm()
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit project')
      }
    } catch (error) {
      console.error('Error submitting project:', error)
      alert('Failed to submit project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      long_description: '',
      demo_url: '',
      github_url: '',
      category_id: '',
      gallery_urls: []
    })
    setErrors({})
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">Submit Your Project</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Project Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="My Awesome Project"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Short Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="A brief description of what your project does..."
                className={`w-full px-3 py-2 border rounded-md resize-none h-20 ${
                  errors.description ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Long Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Detailed Description
              </label>
              <textarea
                value={formData.long_description}
                onChange={(e) => handleInputChange('long_description', e.target.value)}
                placeholder="Tell us more about your project, how you built it, what inspired you..."
                className="w-full px-3 py-2 border border-gray-200 rounded-md resize-none h-32"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.category_id ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
            </div>

            {/* Demo URL */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Demo URL *
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.demo_url}
                  onChange={(e) => handleInputChange('demo_url', e.target.value)}
                  placeholder="https://myproject.com"
                  className={`pl-10 ${errors.demo_url ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.demo_url && <p className="text-red-500 text-xs mt-1">{errors.demo_url}</p>}
            </div>

            {/* GitHub URL */}
            <div>
              <label className="block text-sm font-medium mb-1">
                GitHub URL (optional)
              </label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.github_url}
                  onChange={(e) => handleInputChange('github_url', e.target.value)}
                  placeholder="https://github.com/username/project"
                  className={`pl-10 ${errors.github_url ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.github_url && <p className="text-red-500 text-xs mt-1">{errors.github_url}</p>}
            </div>

            {/* YSWS Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-xs">HC</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">You Ship, We Ship! 🚢</h4>
                  <p className="text-sm text-gray-600">
                    Once approved, your project will be eligible for YSWS rewards from Hack Club! 
                    This could include stickers, hardware, or other maker goodies based on the 
                    creativity and effort of your project.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-red-500 hover:bg-red-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}