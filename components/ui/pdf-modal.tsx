'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, FileText, Eye } from 'lucide-react'

interface PdfModalProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
  title?: string
}

export function PdfModal({ isOpen, onClose, pdfUrl, title = "PDF Document" }: PdfModalProps) {
  const [viewMode, setViewMode] = useState<'embed' | 'direct'>('embed')
  const [embedError, setEmbedError] = useState(false)

  const handleEmbedError = () => {
    setEmbedError(true)
    setViewMode('direct')
  }

  const createGoogleViewerUrl = (url: string) => {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 m-0">
        <DialogTitle className="sr-only">PDF Document</DialogTitle>
        
        {/* Floating close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 left-4 z-10 h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="h-full overflow-hidden">
          {viewMode === 'embed' && !embedError ? (
            <div className="h-full flex flex-col relative">
              {/* Try embedded iframe first */}
              <iframe
                src={pdfUrl}
                className="h-full w-full border-0"
                title={title}
                onError={handleEmbedError}
                onLoad={(e) => {
                  // Check if iframe loaded successfully
                  const iframe = e.target as HTMLIFrameElement
                  try {
                    // This will throw an error if the iframe content is blocked
                    iframe.contentWindow?.document
                  } catch {
                    handleEmbedError()
                  }
                }}
              />
              {embedError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 backdrop-blur-sm">
                  <div className="text-center p-8">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Eye className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">PDF Cannot Be Embedded</h3>
                    <p className="text-gray-600 mb-6 max-w-md">
                      Due to browser security restrictions, this PDF cannot be displayed directly. 
                      Switching to Google Docs Viewer...
                    </p>
                    <Button 
                      onClick={() => setViewMode('direct')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      View with Google Docs Viewer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Fallback to Google Docs Viewer */}
              <iframe
                src={createGoogleViewerUrl(pdfUrl)}
                className="h-full w-full border-0"
                title={`${title} - Google Docs Viewer`}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
