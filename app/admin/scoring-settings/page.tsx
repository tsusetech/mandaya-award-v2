'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Settings, Link } from 'lucide-react'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import api from '@/lib/api'
import { toast } from 'sonner'
import QuestionAssignmentModal from './components/QuestionAssignmentModal'

interface QuestionCategory {
  id: number
  name: string
  description: string
  weight: number
  minValue: number
  maxValue: number
  scoreType: 'number' | 'percentage' | 'currency' | 'rating' | 'boolean'
  createdAt: string
  updatedAt: string
}

interface CategoryData {
  id: number
  name?: string
  description?: string
  weight?: number
  minValue?: number
  maxValue?: number
  scoreType?: 'number' | 'percentage' | 'currency' | 'rating' | 'boolean'
  createdAt?: string
  updatedAt?: string
}

interface ApiError {
  response?: {
    status?: number
    data?: {
      message?: string
    }
  }
}

export default function ScoringSettingsPage() {
  const [categories, setCategories] = useState<QuestionCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null)
  const [editingCategory, setEditingCategory] = useState<QuestionCategory | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight: 1.0,
    minValue: 0.0,
    maxValue: 100.0,
    scoreType: 'number' as 'number' | 'percentage' | 'currency' | 'rating' | 'boolean'
  })
  const [scoreTypeFilter, setScoreTypeFilter] = useState<string>('all')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/question-categories')
      console.log('API Response:', response.data) // Debug log
      
      // Handle the actual response structure from the API
      const categoriesData = Array.isArray(response.data?.questionCategories) ? response.data.questionCategories :
                           Array.isArray(response.data) ? response.data : 
                           Array.isArray(response.data?.categories) ? response.data.categories :
                           Array.isArray(response.data?.data) ? response.data.data : []
      
      console.log('Processed categories:', categoriesData) // Debug log
      
      // Ensure all categories have required properties with defaults
      const processedCategories = categoriesData.map((category: CategoryData) => ({
        id: category.id,
        name: category.name || '',
        description: category.description || '',
        weight: category.weight || 1.0,
        minValue: category.minValue || 0.0,
        maxValue: category.maxValue || 100.0,
        scoreType: (category.scoreType as 'number' | 'percentage' | 'currency' | 'rating' | 'boolean') || 'number',
        createdAt: category.createdAt || new Date().toISOString(),
        updatedAt: category.updatedAt || new Date().toISOString()
      }))
      
      console.log('Final processed categories:', processedCategories) // Debug log
      setCategories(processedCategories)
    } catch (error: unknown) {
      const err = error as ApiError
      console.error('Failed to fetch categories:', err)
      toast.error('Failed to load question categories')
      setCategories([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      await api.post('/question-categories', formData)
      toast.success('Question category created successfully')
      setIsCreateDialogOpen(false)
      resetForm()
      fetchCategories()
    } catch (error: unknown) {
      const err = error as ApiError
      if (err.response?.status === 409) {
        toast.error('Question category name already exists')
      } else {
        toast.error('Failed to create question category')
      }
    }
  }

  const handleEdit = async () => {
    if (!editingCategory) return

    try {
      await api.patch(`/question-categories/${editingCategory.id}`, formData)
      toast.success('Question category updated successfully')
      setIsEditDialogOpen(false)
      setEditingCategory(null)
      resetForm()
      fetchCategories()
    } catch (error: unknown) {
      const err = error as ApiError
      if (err.response?.status === 409) {
        toast.error('Question category name already exists')
      } else {
        toast.error('Failed to update question category')
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question category?')) return

    try {
      await api.delete(`/question-categories/${id}`)
      toast.success('Question category deleted successfully')
      fetchCategories()
    } catch (error: unknown) {
      const err = error as ApiError
      if (err.response?.status === 409) {
        toast.error('Cannot delete category as it is being used in group questions')
      } else {
        toast.error('Failed to delete question category')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      weight: 1.0,
      minValue: 0.0,
      maxValue: 100.0,
      scoreType: 'number'
    })
  }

  const openEditDialog = (category: QuestionCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      weight: category.weight,
      minValue: category.minValue,
      maxValue: category.maxValue,
      scoreType: category.scoreType
    })
    setIsEditDialogOpen(true)
  }

  const openAssignmentModal = (category: QuestionCategory) => {
    setSelectedCategory(category)
    setIsAssignmentModalOpen(true)
  }

  const getScoreTypeColor = (scoreType: string) => {
    const colors = {
      number: 'bg-blue-100 text-blue-800',
      percentage: 'bg-green-100 text-green-800',
      currency: 'bg-yellow-100 text-yellow-800',
      rating: 'bg-purple-100 text-purple-800',
      boolean: 'bg-gray-100 text-gray-800'
    }
    return colors[scoreType as keyof typeof colors] || colors.number
  }

  const filteredCategories = Array.isArray(categories) ? categories.filter(category => 
    scoreTypeFilter === 'all' || category.scoreType === scoreTypeFilter
  ) : []

  if (loading) {
    return (
      <AuthenticatedLayout allowedRoles={['ADMIN', 'SUPERADMIN']}>
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Scoring Settings</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage question categories and scoring criteria</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="scoreTypeFilter" className="text-sm">Filter by type:</Label>
              <select
                id="scoreTypeFilter"
                value={scoreTypeFilter}
                onChange={(e) => setScoreTypeFilter(e.target.value)}
                className="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Types</option>
                <option value="number">Number</option>
                <option value="percentage">Percentage</option>
                <option value="currency">Currency</option>
                <option value="rating">Rating</option>
                <option value="boolean">Boolean</option>
              </select>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Category</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Question Category</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter category name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter category description"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                      placeholder="1.0"
                    />
                  </div>
                                     <div className="grid grid-cols-2 gap-4">
                     <div className="grid gap-2">
                       <Label htmlFor="minValue">Min Value</Label>
                       <Input
                         id="minValue"
                         type="number"
                         step="0.1"
                         value={formData.minValue}
                         onChange={(e) => setFormData({ ...formData, minValue: parseFloat(e.target.value) || 0 })}
                       />
                     </div>
                     <div className="grid gap-2">
                       <Label htmlFor="maxValue">Max Value</Label>
                       <Input
                         id="maxValue"
                         type="number"
                         step="0.1"
                         value={formData.maxValue}
                         onChange={(e) => setFormData({ ...formData, maxValue: parseFloat(e.target.value) || 0 })}
                       />
                     </div>
                   </div>
                  <div className="grid gap-2">
                    <Label htmlFor="scoreType">Score Type</Label>
                    <select
                      id="scoreType"
                      value={formData.scoreType}
                      onChange={(e) => setFormData({ ...formData, scoreType: e.target.value as any })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="number">Number</option>
                      <option value="percentage">Percentage</option>
                      <option value="currency">Currency</option>
                      <option value="rating">Rating</option>
                      <option value="boolean">Boolean</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Categories</CardTitle>
              <Settings className="h-4 w-4 text-blue-600" />
            </CardHeader>
                         <CardContent>
               <div className="text-2xl font-bold text-gray-900">{Array.isArray(categories) ? categories.length : 0}</div>
               <p className="text-xs text-gray-500 mt-1">Question categories</p>
             </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Number Type</CardTitle>
              <Badge className="bg-blue-100 text-blue-800">Number</Badge>
            </CardHeader>
                         <CardContent>
               <div className="text-2xl font-bold text-gray-900">
                 {Array.isArray(categories) ? categories.filter(c => c.scoreType === 'number').length : 0}
               </div>
               <p className="text-xs text-gray-500 mt-1">Categories</p>
             </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Percentage Type</CardTitle>
              <Badge className="bg-green-100 text-green-800">Percentage</Badge>
            </CardHeader>
                         <CardContent>
               <div className="text-2xl font-bold text-gray-900">
                 {Array.isArray(categories) ? categories.filter(c => c.scoreType === 'percentage').length : 0}
               </div>
               <p className="text-xs text-gray-500 mt-1">Categories</p>
             </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Other Types</CardTitle>
              <Badge className="bg-purple-100 text-purple-800">Mixed</Badge>
            </CardHeader>
                         <CardContent>
               <div className="text-2xl font-bold text-gray-900">
                 {Array.isArray(categories) ? categories.filter(c => !['number', 'percentage'].includes(c.scoreType)).length : 0}
               </div>
               <p className="text-xs text-gray-500 mt-1">Categories</p>
             </CardContent>
          </Card>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openAssignmentModal(category)}
                      title="Manage Questions"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(category)}
                      title="Edit Category"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Badge className={`w-fit ${getScoreTypeColor(category.scoreType)}`}>
                  {category.scoreType}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Weight:</span>
                    <span className="font-medium">{category.weight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Range:</span>
                    <span className="font-medium">{category.minValue} - {category.maxValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!Array.isArray(filteredCategories) || filteredCategories.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Question Categories</h3>
              <p className="text-gray-600 text-center mb-4">
                Get started by creating your first question category to define scoring criteria.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Category
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Question Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-weight">Weight</Label>
                <Input
                  id="edit-weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                  placeholder="1.0"
                />
              </div>
                             <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                   <Label htmlFor="edit-minValue">Min Value</Label>
                   <Input
                     id="edit-minValue"
                     type="number"
                     step="0.1"
                     value={formData.minValue}
                     onChange={(e) => setFormData({ ...formData, minValue: parseFloat(e.target.value) || 0 })}
                   />
                 </div>
                 <div className="grid gap-2">
                   <Label htmlFor="edit-maxValue">Max Value</Label>
                   <Input
                     id="edit-maxValue"
                     type="number"
                     step="0.1"
                     value={formData.maxValue}
                     onChange={(e) => setFormData({ ...formData, maxValue: parseFloat(e.target.value) || 0 })}
                   />
                 </div>
               </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-scoreType">Score Type</Label>
                <select
                  id="edit-scoreType"
                  value={formData.scoreType}
                  onChange={(e) => setFormData({ ...formData, scoreType: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="number">Number</option>
                  <option value="percentage">Percentage</option>
                  <option value="currency">Currency</option>
                  <option value="rating">Rating</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>Update</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Question Assignment Modal */}
        {selectedCategory && (
          <QuestionAssignmentModal
            category={selectedCategory}
            isOpen={isAssignmentModalOpen}
            onOpenChange={setIsAssignmentModalOpen}
            onUpdate={fetchCategories}
          />
        )}
      </div>
    </AuthenticatedLayout>
  )
}
