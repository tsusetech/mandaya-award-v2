'use client'

import React from 'react'
import { createOptimizedImageUrl } from '@/lib/upload'

interface PdfModalProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
  title?: string
}

export function PdfModal({ isOpen, onClose, pdfUrl, title = "PDF Document" }: PdfModalProps) {
  // Check if the URL is an image file
  const isImageFile = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
    const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf']
    const urlLower = url.toLowerCase()
    
    // First check if it's a document (exclude from images)
    const isDocument = documentExtensions.some(ext => urlLower.includes(ext))
    if (isDocument) return false
    
    // Then check if it's an image
    const isImage = imageExtensions.some(ext => urlLower.includes(ext))
    const isCloudinaryImage = urlLower.includes('cloudinary.com') && !isDocument
    
    return isImage || isCloudinaryImage
  }

  // For non-image files, just open in new tab immediately
  React.useEffect(() => {
    if (isOpen && !isImageFile(pdfUrl)) {
      window.open(pdfUrl, '_blank')
      onClose() // Close modal after opening new tab
    }
  }, [isOpen, pdfUrl, onClose])

  // Only show modal for images
  if (!isImageFile(pdfUrl)) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="relative max-w-[95vw] max-h-[95vh] bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all rounded-full flex items-center justify-center"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Image display */}
        <img
          src={createOptimizedImageUrl(pdfUrl, 1200, 800, 'auto')}
          alt={title}
          className="max-h-[95vh] max-w-[95vw] object-contain"
          onError={(e) => {
            console.error('Failed to load image:', pdfUrl)
            // If image fails to load, open in new tab as fallback
            window.open(pdfUrl, '_blank')
            onClose()
          }}
        />
      </div>
    </div>
  )
}
