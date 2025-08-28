'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Settings, Link, TrendingUp, BarChart3, Calculator, Filter, Download, ArrowLeft } from 'lucide-react'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import api from '@/lib/api'
import { toast } from 'sonner'
import QuestionAssignmentModal from './components/QuestionAssignmentModal'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
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
      number: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      percentage: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      currency: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      rating: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      boolean: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
    return colors[scoreType as keyof typeof colors] || colors.number
  }

  const getScoreTypeIcon = (scoreType: string) => {
    const icons = {
      number: '🔢',
      percentage: '📊',
      currency: '💰',
      rating: '⭐',
      boolean: '✅'
    }
    return icons[scoreType as keyof typeof icons] || '🔢'
  }

  const filteredCategories = Array.isArray(categories) ? categories.filter(category => 
    scoreTypeFilter === 'all' || category.scoreType === scoreTypeFilter
  ) : []

  if (loading) {
    return (
      <AuthenticatedLayout allowedRoles={['ADMIN', 'SUPERADMIN']}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="p-6 space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/5 to-purple-600/5 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-400/5 to-purple-500/5 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-purple-500/3 to-purple-600/3 blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-purple-500/10 via-purple-600/10 to-purple-500/10 border-b border-purple-200/50 dark:border-purple-800/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 32 32\\'><path fill=\\'%239C27B0\\' d=\\'M0 31h32v1H0zM31 0v32h1V0z\\'/></svg>')] opacity-5"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/admin')}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-gray-900 dark:text-white backdrop-blur-sm border border-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Button>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg border-2 border-purple-400/50">
                    <Settings className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">
                      Scoring Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Manage question categories and scoring criteria with advanced configuration
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50">
                  <Label htmlFor="scoreTypeFilter" className="text-sm">Filter:</Label>
                  <select
                    id="scoreTypeFilter"
                    value={scoreTypeFilter}
                    onChange={(e) => setScoreTypeFilter(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm"
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
                    <Button className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200">
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
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Categories</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 group-hover:from-purple-200 dark:group-hover:from-purple-900/60 group-hover:to-purple-300 dark:group-hover:to-purple-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{Array.isArray(categories) ? categories.length : 0}</div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Question categories</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Number Type</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:from-blue-200 dark:group-hover:from-blue-900/60 group-hover:to-blue-300 dark:group-hover:to-blue-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <span className="text-lg">🔢</span>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {Array.isArray(categories) ? categories.filter(c => c.scoreType === 'number').length : 0}
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Categories</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Percentage Type</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 group-hover:from-green-200 dark:group-hover:from-green-900/60 group-hover:to-green-300 dark:group-hover:to-green-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <span className="text-lg">📊</span>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {Array.isArray(categories) ? categories.filter(c => c.scoreType === 'percentage').length : 0}
                </div>
                <div className="flex items-center space-x-2">
                  <Calculator className="h-4 w-4 text-green-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Categories</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Other Types</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 group-hover:from-orange-200 dark:group-hover:from-orange-900/60 group-hover:to-orange-300 dark:group-hover:to-orange-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <span className="text-lg">⭐</span>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {Array.isArray(categories) ? categories.filter(c => !['number', 'percentage'].includes(c.scoreType)).length : 0}
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-orange-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Categories</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40">
                        <span className="text-lg">{getScoreTypeIcon(category.scoreType)}</span>
                      </div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">{category.name}</CardTitle>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAssignmentModal(category)}
                        title="Manage Questions"
                        className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 transition-all duration-200"
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                        title="Edit Category"
                        className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        title="Delete Category"
                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge className={`w-fit ${getScoreTypeColor(category.scoreType)}`}>
                    {category.scoreType}
                  </Badge>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{category.description}</p>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{category.weight}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Range:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{category.minValue} - {category.maxValue}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!Array.isArray(filteredCategories) || filteredCategories.length === 0) && (
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="flex flex-col items-center justify-center py-12 relative z-10">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 mb-4">
                  <Settings className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Question Categories</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                  Get started by creating your first question category to define scoring criteria.
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200"
                >
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
      </div>
    </AuthenticatedLayout>
  )
}
