// File upload utilities for external services

// Cloudinary upload function
export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary credentials not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET environment variables.')
  }

  // Validate file before upload
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  // Use RAW for non-images
  const isImage = file.type.startsWith('image/')
  const endpoint = isImage ? 'image' : 'raw'
  console.log(`Uploading ${file.type} file to ${endpoint} endpoint`)

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        endpoint,
        fileType: file.type,
      })
      throw new Error(errorData.error?.message || `Upload failed with status ${response.status}: ${response.statusText}`)
    }

    const data = await response.json() as {
      secure_url?: string
      public_id: string
      resource_type: string
      format?: string // e.g., 'pdf'
    }

    // If Cloudinary didn't include the extension in secure_url (common for raw),
    // build a canonical URL with the format appended.
    if (data.format && data.secure_url && !data.secure_url.toLowerCase().endsWith(`.${data.format.toLowerCase()}`)) {
      const finalUrl = `https://res.cloudinary.com/${cloudName}/${data.resource_type}/upload/${data.public_id}.${data.format}`
      return finalUrl
    }

    if (!data.secure_url) {
      throw new Error('Upload successful but no URL returned')
    }

    return data.secure_url
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error('Network error during upload. Please check your internet connection and try again.')
  }
}

// Imgur upload function (for images only)
export async function uploadToImgur(file: File): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID
  
  if (!clientId) {
    throw new Error('Imgur credentials not configured')
  }

  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: {
      'Authorization': `Client-ID ${clientId}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  const data = await response.json()
  return data.data.link
}

// Simple fallback - just return the filename
export function getFilenameOnly(file: File): string {
  return file.name
}

// Helper function to get file type category
export function getFileTypeCategory(file: File): 'image' | 'document' | 'other' {
  if (file.type.startsWith('image/')) {
    return 'image'
  }
  
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf'
  ]
  
  if (documentTypes.includes(file.type)) {
    return 'document'
  }
  
  return 'other'
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Helper function to validate file before upload
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Maximum allowed size is 10MB. Your file is ${formatFileSize(file.size)}.`
    }
  }

  // Check file type
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/rtf'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not supported. Allowed types: images (JPEG, PNG, GIF, WebP, SVG), PDF, DOC, DOCX, TXT, RTF. Your file type: ${file.type}`
    }
  }

  return { valid: true }
}

// Helper function to create PDF viewer URL with proper parameters
export function createPdfViewerUrl(pdfUrl: string): string {
  // Add parameters to make PDF viewing more reliable
  const params = new URLSearchParams({
    'toolbar': '0',
    'navpanes': '0', 
    'scrollbar': '1',
    'statusbar': '0',
    'messages': '0'
  })
  
  return `${pdfUrl}#${params.toString()}`
}

// Helper function to check if URL is a PDF
export function isPdfUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase()
  return lowerUrl.includes('.pdf') || lowerUrl.endsWith('/pdf') || lowerUrl.includes('format=pdf')
}

// Helper function to get file type from URL
export function getFileTypeFromUrl(url: string): 'image' | 'pdf' | 'document' | 'other' {
  const lowerUrl = url.toLowerCase()
  
  // Check for PDF (including our new canonical format)
  if (lowerUrl.includes('.pdf') || lowerUrl.endsWith('/pdf') || lowerUrl.includes('format=pdf')) {
    return 'pdf'
  }
  
  // Check for images
  if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || lowerUrl.includes('.png') || 
      lowerUrl.includes('.gif') || lowerUrl.includes('.webp') || lowerUrl.includes('.svg')) {
    return 'image'
  }
  
  // Check for other documents
  if (lowerUrl.includes('.doc') || lowerUrl.includes('.txt') || lowerUrl.includes('.rtf')) {
    return 'document'
  }
  
  return 'other'
}
