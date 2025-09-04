// File upload utilities for external services

// Cloudinary upload function
export async function uploadToCloudinary(file: File): Promise<string> {
  // You'll need to set up Cloudinary credentials
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary credentials not configured')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  const data = await response.json()
  return data.secure_url
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
