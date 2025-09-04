'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Upload, Save, FileText } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { uploadToCloudinary } from '@/lib/upload'

export default function SubmitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    files: [] as File[]
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...Array.from(e.target.files || [])]
      }))
    }
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (asDraft: boolean = false) => {
    try {
      setLoading(true)

      // Create form data
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('status', asDraft ? 'draft' : 'submitted')
      
      formData.files.forEach(file => {
        formDataToSend.append('files', file)
      })

      await api.post('/submissions', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success(asDraft ? 'Draft saved successfully' : 'Submission created successfully')
      router.push('/peserta')
    } catch (err) {
      console.error('Error creating submission:', err)
      toast.error('Failed to create submission')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/peserta')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">New Submission</h1>
                <p className="text-gray-600">Create a new submission or save as draft</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => handleSubmit(true)}
                disabled={loading || !formData.title}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save as Draft</span>
              </Button>
              <Button 
                onClick={() => handleSubmit(false)}
                disabled={loading || !formData.title || formData.files.length === 0}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Submit</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <Input
                placeholder="Enter submission title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter submission description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                  >
                    <span>Upload files</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">Images, PDF, DOC, DOCX, TXT, RTF up to 10MB each</p>
              </div>

              {formData.files.length > 0 && (
                <div className="mt-6 space-y-2">
                  {formData.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
