'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { uploadToCloudinary, uploadToImgur, getFilenameOnly } from '@/lib/upload'

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
  autoSave = true
}: QuestionProps) {
  const [localValue, setLocalValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: any) => {
    setLocalValue(newValue)
    setAutoSaveStatus('saving')
    onChange(newValue)
    
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
    
    // Debug logging for troubleshooting
    if (process.env.NODE_ENV === 'development') {
      console.log('Rendering input for type:', { 
        inputType, 
        normalizedInputType, 
        optionsLength: options?.length,
        questionText: questionText.substring(0, 50) + '...'
      })
    }
    switch (normalizedInputType) {
      case 'text-open':
        return (
          <Textarea
            value={localValue || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="Type your answer here..."
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
            placeholder="Type your answer here..."
          />
        )

      case 'numeric':
        return (
          <Input
            type="number"
            value={localValue || ''}
            onChange={(e) => handleChange(parseFloat(e.target.value))}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="Enter a number"
          />
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${option.id}`}
                  checked={(localValue || []).includes(option.optionValue)}
                  onCheckedChange={(checked) => {
                    const newValue = checked
                      ? [...(localValue || []), option.optionValue]
                      : (localValue || []).filter((v: string) => v !== option.optionValue)
                    handleChange(newValue)
                  }}
                />
                <Label htmlFor={`option-${option.id}`}>{option.optionText}</Label>
              </div>
            ))}
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
              placeholder="Type your answer here..."
              className="min-h-[100px]"
            />
          )
        }
        
        // Multiple-choice should allow multiple selections like checkboxes
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${option.id}`}
                  checked={(localValue || []).includes(option.optionValue)}
                  onCheckedChange={(checked) => {
                    const newValue = checked
                      ? [...(localValue || []), option.optionValue]
                      : (localValue || []).filter((v: string) => v !== option.optionValue)
                    handleChange(newValue)
                  }}
                />
                <Label htmlFor={`option-${option.id}`}>{option.optionText}</Label>
              </div>
            ))}
          </div>
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
          <Input
            type="email"
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="Enter your email address"
          />
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
            placeholder="Enter a URL"
          />
        )

      case 'file':
      case 'file-upload':
      case 'upload-file':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  try {
                    // Show loading state
                    handleChange('Uploading...')
                    
                    // Option 1: Upload to Cloudinary (recommended)
                    const imageUrl = await uploadToCloudinary(file)
                    handleChange(imageUrl)
                    
                    // Option 2: Upload to Imgur (for images only)
                    // const imageUrl = await uploadToImgur(file)
                    // handleChange(imageUrl)
                    
                    // Option 3: Just store filename for now (fallback)
                    // handleChange(file.name)
                    
                  } catch (error) {
                    console.error('Upload failed:', error)
                    handleChange('Upload failed')
                  }
                }
              }}
              onBlur={handleBlur}
              onFocus={handleFocus}
            />
            {localValue && localValue !== 'Uploading...' && localValue !== 'Upload failed' && (
              <div className="mt-2">
                {localValue.startsWith('http') ? (
                  <div>
                    <p className="text-sm text-green-600">✓ File uploaded successfully</p>
                    <a 
                      href={localValue} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View uploaded file
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Selected file: {localValue}</p>
                )}
              </div>
            )}
            {localValue === 'Uploading...' && (
              <p className="text-sm text-blue-600">Uploading file...</p>
            )}
            {localValue === 'Upload failed' && (
              <p className="text-sm text-red-600">Upload failed. Please try again.</p>
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
                 placeholder="Please enter your answer here..."
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

      {validationError && (
        <p className="text-sm text-red-500 mt-1 break-words">{validationError}</p>
      )}

      {autoSave && autoSaveStatus !== 'idle' && (
        <p className={`text-xs mt-1 ${
          autoSaveStatus === 'saving' ? 'text-blue-500' : 'text-green-500'
        }`}>
          {getAutoSaveMessage()}
        </p>
      )}
    </div>
  )
}
