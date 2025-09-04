'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { uploadToCloudinary, uploadToImgur, getFilenameOnly, isPdfUrl, createPdfViewerUrl } from '@/lib/upload'
import { PdfModal } from '@/components/ui/pdf-modal'

// Indonesian provinces data (updated 2024)
const INDONESIAN_PROVINCES = [
  { id: 1, name: 'Aceh', value: 'Aceh' },
  { id: 2, name: 'Sumatera Utara', value: 'Sumatera Utara' },
  { id: 3, name: 'Sumatera Barat', value: 'Sumatera Barat' },
  { id: 4, name: 'Riau', value: 'Riau' },
  { id: 5, name: 'Kepulauan Riau', value: 'Kepulauan Riau' },
  { id: 6, name: 'Jambi', value: 'Jambi' },
  { id: 7, name: 'Sumatera Selatan', value: 'Sumatera Selatan' },
  { id: 8, name: 'Kepulauan Bangka Belitung', value: 'Kepulauan Bangka Belitung' },
  { id: 9, name: 'Bengkulu', value: 'Bengkulu' },
  { id: 10, name: 'Lampung', value: 'Lampung' },
  { id: 11, name: 'DKI Jakarta', value: 'DKI Jakarta' },
  { id: 12, name: 'Banten', value: 'Banten' },
  { id: 13, name: 'Jawa Barat', value: 'Jawa Barat' },
  { id: 14, name: 'Jawa Tengah', value: 'Jawa Tengah' },
  { id: 15, name: 'DI Yogyakarta', value: 'DI Yogyakarta' },
  { id: 16, name: 'Jawa Timur', value: 'Jawa Timur' },
  { id: 17, name: 'Bali', value: 'Bali' },
  { id: 18, name: 'Nusa Tenggara Barat', value: 'Nusa Tenggara Barat' },
  { id: 19, name: 'Nusa Tenggara Timur', value: 'Nusa Tenggara Timur' },
  { id: 20, name: 'Kalimantan Barat', value: 'Kalimantan Barat' },
  { id: 21, name: 'Kalimantan Tengah', value: 'Kalimantan Tengah' },
  { id: 22, name: 'Kalimantan Selatan', value: 'Kalimantan Selatan' },
  { id: 23, name: 'Kalimantan Timur', value: 'Kalimantan Timur' },
  { id: 24, name: 'Kalimantan Utara', value: 'Kalimantan Utara' },
  { id: 25, name: 'Sulawesi Utara', value: 'Sulawesi Utara' },
  { id: 26, name: 'Gorontalo', value: 'Gorontalo' },
  { id: 27, name: 'Sulawesi Tengah', value: 'Sulawesi Tengah' },
  { id: 28, name: 'Sulawesi Barat', value: 'Sulawesi Barat' },
  { id: 29, name: 'Sulawesi Selatan', value: 'Sulawesi Selatan' },
  { id: 30, name: 'Sulawesi Tenggara', value: 'Sulawesi Tenggara' },
  { id: 31, name: 'Maluku', value: 'Maluku' },
  { id: 32, name: 'Maluku Utara', value: 'Maluku Utara' },
  { id: 33, name: 'Papua', value: 'Papua' },
  { id: 34, name: 'Papua Barat', value: 'Papua Barat' },
  { id: 35, name: 'Papua Tengah', value: 'Papua Tengah' },
  { id: 36, name: 'Papua Pegunungan', value: 'Papua Pegunungan' },
  { id: 37, name: 'Papua Selatan', value: 'Papua Selatan' }
]

interface QuestionOption {
  id: number
  optionText: string
  optionValue: string
  isCorrect?: boolean
}

interface QuestionProps {
  id: number
  questionText: string
  description?: string
  inputType: string
  isRequired: boolean
  options?: QuestionOption[]
  value: any
  onChange: (value: any) => void
  onBlur?: () => void
  validationError?: string
  autoSave?: boolean
  isPrefilledFromAuth?: boolean
}

export function QuestionInput({ 
  id,
  questionText,
  description,
  inputType,
  isRequired,
  options = [],
  value,
  onChange,
  onBlur,
  validationError,
  autoSave = true,
  isPrefilledFromAuth = false
}: QuestionProps) {
  // Check if this question needs a URL input based on description keywords
  const needsUrlInput = description && (
    description.toLowerCase().includes('tautan') ||
    description.toLowerCase().includes('link') ||
    description.toLowerCase().includes('bukti') ||
    description.toLowerCase().includes('bukti dukung') ||
    description.toLowerCase().includes('lampirkan') ||
    description.toLowerCase().includes('url') ||
    description.toLowerCase().includes('website') ||
    description.toLowerCase().includes('situs')
  )
  const [localValue, setLocalValue] = useState(() => {
    // Ensure checkbox questions always have array values
    // Multiple-choice questions (except province) should be single values
    const isProvinceQuestion = questionText.toLowerCase().includes('nama provinsi') || 
                              questionText.toLowerCase().includes('provinsi')
    
    if (inputType === 'checkbox' && !Array.isArray(value)) {
      return []
    }
    return value
  })
  
  // Handle URL input separately
  const [urlValue, setUrlValue] = useState(() => {
    // If value is an object with url property, extract it
    if (typeof value === 'object' && value !== null && value.url) {
      return value.url
    }
    return ''
  })
  const [isFocused, setIsFocused] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [pdfModalOpen, setPdfModalOpen] = useState(false)

  // Update local value when prop value changes
  useEffect(() => {
    // Handle combined value structure (answer + url)
    if (needsUrlInput && typeof value === 'object' && value !== null) {
      setLocalValue(value.answer || '')
      setUrlValue(value.url || '')
    } else {
      // Ensure checkbox questions always have array values
      // Multiple-choice questions (except province) should be single values
      if (inputType === 'checkbox' && !Array.isArray(value)) {
        setLocalValue([])
      } else {
        setLocalValue(value)
      }
      setUrlValue('')
    }
  }, [value, inputType, needsUrlInput])

  const handleChange = (newValue: any) => {
    setLocalValue(newValue)
    setAutoSaveStatus('saving')
    
    // If URL input is needed, combine the values
    if (needsUrlInput) {
      const combinedValue = {
        answer: newValue,
        url: urlValue
      }
      onChange(combinedValue)
    } else {
      onChange(newValue)
    }
    
    // Reset auto-save status after a delay
    setTimeout(() => {
      setAutoSaveStatus('saved')
      setTimeout(() => setAutoSaveStatus('idle'), 2000)
    }, 1000)
  }
  
  const handleUrlChange = (newUrlValue: string) => {
    setUrlValue(newUrlValue)
    setAutoSaveStatus('saving')
    
    // Combine the main answer with the URL
    const combinedValue = {
      answer: localValue,
      url: newUrlValue
    }
    onChange(combinedValue)
    
    // Reset auto-save status after a delay
    setTimeout(() => {
      setAutoSaveStatus('saved')
      setTimeout(() => setAutoSaveStatus('idle'), 2000)
    }, 1000)
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (onBlur) onBlur()
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const renderInput = () => {
    // Normalize input type to lowercase for case-insensitive matching
    const normalizedInputType = inputType.toLowerCase()
    
    // Check if this is a province selection question
    const isProvinceQuestion = questionText.toLowerCase().includes('nama provinsi') || 
                              questionText.toLowerCase().includes('provinsi')
    
    // Debug logging for troubleshooting
    if (process.env.NODE_ENV === 'development') {
      console.log('Rendering input for type:', { 
        inputType, 
        normalizedInputType, 
        optionsLength: options?.length,
        questionText: questionText.substring(0, 50) + '...',
        isProvinceQuestion
      })
    }

    // Special case for Indonesian provinces - single selection dropdown
    if (isProvinceQuestion && (normalizedInputType === 'multiple-choice' || normalizedInputType === 'multiple choice' || normalizedInputType === 'multiple_choice')) {
      // For province selection, we want a single string value, not an array
      const provinceValue = Array.isArray(localValue) ? (localValue.length > 0 ? localValue[0] : '') : (localValue || '')
      
      return (
        <select
          value={provinceValue}
          onChange={(e) => handleChange(e.target.value)} // This will set a single string value
          onBlur={handleBlur}
          onFocus={handleFocus}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Pilih Provinsi...</option>
          {INDONESIAN_PROVINCES.map((province) => (
            <option key={province.id} value={province.value}>
              {province.name}
            </option>
          ))}
        </select>
      )
    }
    
    switch (normalizedInputType) {
      case 'text-open':
        return (
          <Textarea
            value={localValue || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="Ketik jawaban Anda di sini..."
            className="min-h-[100px]"
          />
        )

      case 'text-short':
        return (
          <Input
            type="text"
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="Ketik jawaban Anda di sini..."
          />
        )

      case 'numeric-open':
        return (
          <Input
            type="number"
            value={localValue || ''}
            onChange={(e) => handleChange(parseFloat(e.target.value))}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="Masukkan angka"
          />
        )

             case 'checkbox':
         return (
           <div className="space-y-2">
             {options.map((option) => {
               const isOtherOption = option.optionValue.toLowerCase() === 'other' || 
                                   option.optionText.toLowerCase() === 'other' ||
                                   option.optionValue.toLowerCase() === 'lainnya_sebutkan' ||
                                   option.optionText.toLowerCase() === 'lainnya sebutkan' ||
                                   option.optionValue.toLowerCase() === 'lainnya' ||
                                   option.optionText.toLowerCase() === 'lainnya'
               const isChecked = (localValue || []).some((v: any) => {
                 if (typeof v === 'string') {
                   return v === option.optionValue
                 }
                 return v.value === option.optionValue
               })
               
               return (
                 <div key={option.id} className="space-y-2">
                   <div className="flex items-center space-x-2">
                     <Checkbox
                       id={`option-${option.id}`}
                       checked={isChecked}
                       onCheckedChange={(checked) => {
                         const currentValues = localValue || []
                         let newValue
                         
                         if (checked) {
                           // Add the option value
                           newValue = [...currentValues, option.optionValue]
                         } else {
                           // Remove the option value and any associated other text
                           newValue = currentValues.filter((v: any) => {
                             if (typeof v === 'string') {
                               return v !== option.optionValue
                             }
                             return v.value !== option.optionValue
                           })
                         }
                         
                         handleChange(newValue)
                       }}
                     />
                     <Label htmlFor={`option-${option.id}`}>{option.optionText}</Label>
                   </div>
                   
                   {/* Show free text input for 'other' option when checked */}
                   {isOtherOption && isChecked && (
                     <div className="ml-6 mt-2">
                       <Input
                         type="text"
                         placeholder="Silakan sebutkan..."
                         value={(() => {
                           // Find the other text value from the array
                           const otherItem = (localValue || []).find((v: any) => {
                             if (typeof v === 'string') {
                               return v === option.optionValue
                             }
                             return v.value === option.optionValue
                           })
                           return typeof otherItem === 'object' ? otherItem.otherText || '' : ''
                         })()}
                         onChange={(e) => {
                           // Update the other text while preserving other selected values
                           const currentValues = localValue || []
                           const newValue = currentValues.map((v: any) => {
                             if (typeof v === 'string' && v === option.optionValue) {
                               return { value: v, otherText: e.target.value }
                             }
                             if (typeof v === 'object' && v.value === option.optionValue) {
                               return { ...v, otherText: e.target.value }
                             }
                             return v
                           })
                           handleChange(newValue)
                         }}
                         onBlur={handleBlur}
                         onFocus={handleFocus}
                         className="w-full"
                       />
                     </div>
                   )}
                 </div>
               )
             })}
           </div>
         )

      case 'multiple-choice':
      case 'multiple choice':
      case 'multiple_choice':
        // Debug logging for multiple choice questions
        if (process.env.NODE_ENV === 'development') {
          console.log('Multiple choice question:', { 
            optionsLength: options?.length,
            inputType, 
            questionText: questionText.substring(0, 50) + '...'
          })
        }
        if (!options || options.length === 0) {
          // If it's a multiple-choice question with no options, treat it as text
          if (process.env.NODE_ENV === 'development') {
            console.log('Multiple choice with no options, treating as text input')
          }
          return (
            <Textarea
              value={localValue || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e.target.value)}
              onBlur={handleBlur}
              onFocus={handleFocus}
              placeholder="Ketik jawaban Anda di sini..."
              className="min-h-[100px]"
            />
          )
        }
        
        // Multiple-choice should be single selection (like radio buttons)
        // Convert array value to single string for radio group
        const radioValue = Array.isArray(localValue) ? (localValue.length > 0 ? localValue[0] : '') : (localValue || '')
        
        return (
          <RadioGroup
            value={radioValue}
            onValueChange={handleChange}
            className="space-y-2"
          >
            {options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.optionValue} id={`option-${option.id}`} />
                <Label htmlFor={`option-${option.id}`}>{option.optionText}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'radio':
        return (
          <RadioGroup
            value={localValue || ''}
            onValueChange={handleChange}
            className="space-y-2"
          >
            {options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.optionValue} id={`option-${option.id}`} />
                <Label htmlFor={`option-${option.id}`}>{option.optionText}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'select':
      case 'dropdown':
        return (
          <select
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an option...</option>
            {options.map((option) => (
              <option key={option.id} value={option.optionValue}>
                {option.optionText}
              </option>
            ))}
          </select>
        )

      case 'boolean':
      case 'yes-no':
        return (
          <RadioGroup
            value={localValue || ''}
            onValueChange={handleChange}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="yes" />
              <Label htmlFor="yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="no" />
              <Label htmlFor="no">No</Label>
            </div>
          </RadioGroup>
        )

      case 'date':
        return (
          <Input
            type="date"
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
          />
        )

      case 'email':
        return (
          <div className="space-y-2">
            <Input
              type="email"
              value={localValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              onFocus={handleFocus}
              placeholder="Masukkan alamat email Anda"
            />
            {isPrefilledFromAuth && localValue && (
              <p className="text-xs text-blue-600">
                ✓ Pre-filled with your authenticated email address
              </p>
            )}
          </div>
        )

      case 'url':
      case 'link':
        return (
          <Input
            type="url"
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="Masukkan URL"
          />
        )

      case 'file':
      case 'file-upload':
      case 'upload-file':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt,.rtf"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  try {
                    // Show loading state
                    handleChange('Mengunggah...')
                    
                    // Upload to Cloudinary (supports both images and documents)
                    const fileUrl = await uploadToCloudinary(file)
                    handleChange(fileUrl)
                    
                    // Option 2: Upload to Imgur (for images only)
                    // const imageUrl = await uploadToImgur(file)
                    // handleChange(imageUrl)
                    
                    // Option 3: Just store filename for now (fallback)
                    // handleChange(file.name)
                    
                  } catch (error) {
                    console.error('Upload failed:', error)
                    const errorMessage = error instanceof Error ? error.message : 'Gagal mengunggah'
                    handleChange(`Error: ${errorMessage}`)
                  }
                }
              }}
              onBlur={handleBlur}
              onFocus={handleFocus}
            />
            {localValue && localValue !== 'Mengunggah...' && localValue !== 'Gagal mengunggah' && !localValue.startsWith('Error:') && (
              <div className="mt-2">
                {localValue.startsWith('http') ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600">✓ File berhasil diunggah</p>
                    {isPdfUrl(localValue) ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setPdfModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        📄 View PDF
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(localValue, '_blank', 'noopener,noreferrer')}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        📄 View File
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Selected file: {localValue}</p>
                )}
              </div>
            )}
            {localValue && localValue.startsWith('Error:') && (
              <div className="mt-2">
                <p className="text-sm text-red-600">{localValue}</p>
              </div>
            )}
            {localValue === 'Mengunggah...' && (
              <p className="text-sm text-blue-600">Mengunggah file...</p>
            )}
            {localValue === 'Gagal mengunggah' && (
              <p className="text-sm text-red-600">Gagal mengunggah. Silakan coba lagi.</p>
            )}
          </div>
        )

             default:
         return (
           <div className="p-4 border border-red-200 bg-red-50 rounded-md">
             <p className="text-red-600 font-medium">Unsupported question type: {inputType}</p>
             <p className="text-red-500 text-sm mt-1">
               Please contact support to add support for this question type.
             </p>
             <p className="text-red-500 text-sm">
               Normalized type: {normalizedInputType}
             </p>
             <div className="mt-2">
               <Input
                 type="text"
                 value={localValue || ''}
                 onChange={(e) => handleChange(e.target.value)}
                 onBlur={handleBlur}
                 onFocus={handleFocus}
                 placeholder="Silakan masukkan jawaban Anda di sini..."
                 className="border-red-300"
               />
             </div>
           </div>
         )
    }
  }

  const getAutoSaveMessage = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return 'Auto-saving...'
      case 'saved':
        return 'Auto-saved'
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold break-words">
          {questionText}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && (
          <p className="text-sm text-gray-500 mt-1 break-words">{description}</p>
        )}
      </div>

      {renderInput()}

      {/* URL input field for questions that need supporting links/evidence */}
      {needsUrlInput && (
        <div className="mt-4">
          <Label className="text-sm font-medium text-gray-700">
            Tautan/Bukti Dukung
          </Label>
          <Input
            type="url"
            value={urlValue}
            onChange={(e) => handleUrlChange(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="https://contoh.com"
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Masukkan tautan atau URL untuk bukti pendukung
          </p>
        </div>
      )}

      {validationError && (
        <p className="text-sm text-red-500 mt-1 break-words">{validationError}</p>
      )}

      {/* Auto-save status - always reserve space to prevent layout shifts */}
      <div className="h-2 mt-1">
        {autoSave && autoSaveStatus !== 'idle' && (
          <p className={`text-xs ${
            autoSaveStatus === 'saving' ? 'text-blue-500' : 'text-green-500'
          }`}>
            {getAutoSaveMessage()}
          </p>
        )}
      </div>

      {/* PDF Modal for file uploads */}
      {localValue && localValue.startsWith('http') && isPdfUrl(localValue) && (
        <PdfModal
          isOpen={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          pdfUrl={localValue}
          title={questionText}
        />
      )}
    </div>
  )
}
