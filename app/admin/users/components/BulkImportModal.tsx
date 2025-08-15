'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, X, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'

interface BulkImportResult {
  email: string
  username: string
  success: boolean
  message: string
  error?: string
  userId?: number
}

interface BulkImportResponse {
  message: string
  totalProcessed: number
  successful: number
  failed: number
  results: BulkImportResult[]
  validationErrors: string[]
}

interface BulkImportModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BulkImportModal({ open, onClose, onSuccess }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<BulkImportResponse | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ]
    
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Please select a valid Excel file (.xlsx or .xls)')
      return
    }
    
    setFile(selectedFile)
    setResults(null)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/auth/bulk-register/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setResults(response.data)
      toast.success(`Bulk import completed: ${response.data.successful} successful, ${response.data.failed} failed`)
      onSuccess()
    } catch (error: any) {
      console.error('Bulk import error:', error)
      toast.error(error.response?.data?.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    // Create a simple CSV template that can be opened in Excel
    const template = [
      ['email', 'username', 'password', 'name', 'role', 'groupId'],
      ['user1@example.com', 'user1', 'password123', 'John Doe', 'USER', '1'],
      ['user2@example.com', 'user2', 'password123', 'Jane Smith', 'ADMIN', '2'],
      ['user3@example.com', 'user3', 'password123', 'Bob Johnson', 'USER', ''],
    ]

    const csvContent = template.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'user_import_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const resetForm = () => {
    setFile(null)
    setResults(null)
    setDragActive(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>Bulk Import Users</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Section */}
          {!results && (
            <div className="space-y-4">
                             <div className="text-sm text-gray-600">
                 <p>Upload an Excel file (.xlsx or .xls) with the following columns:</p>
                 <ul className="list-disc list-inside mt-2 space-y-1">
                   <li><strong>Required:</strong> email, username, password</li>
                   <li><strong>Optional:</strong> name, role, groupId</li>
                 </ul>
                 <p className="mt-2 text-xs text-gray-500">
                   <strong>Note:</strong> The role field accepts: USER, ADMIN, JURY, PESERTA. 
                   Leave groupId empty if you don't want to assign users to a specific group.
                 </p>
               </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Template</span>
                </Button>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {file ? file.name : 'Drop your Excel file here or click to browse'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports .xlsx and .xls files
                  </p>
                </label>
              </div>

              {file && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload & Import</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Import Results</h3>
                <Button variant="outline" onClick={resetForm}>
                  Import Another File
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Processed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{results.totalProcessed}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Successful</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{results.successful}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Validation Errors */}
              {results.validationErrors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Validation Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {results.validationErrors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600 flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {results.results.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {result.success ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            <div>
                              <p className="font-medium">{result.email}</p>
                              <p className="text-sm text-gray-600">@{result.username}</p>
                            </div>
                          </div>
                          <Badge variant={result.success ? 'default' : 'destructive'}>
                            {result.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                        <p className="text-sm mt-2">
                          {result.success ? result.message : result.error}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
