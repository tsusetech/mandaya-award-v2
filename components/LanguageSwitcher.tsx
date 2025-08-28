'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Globe, Check } from 'lucide-react'
import { locales, type Locale, getLocaleName, getLocaleFlag } from '@/lib/i18n'

interface LanguageSwitcherProps {
  currentLocale: Locale
  className?: string
}

export default function LanguageSwitcher({ currentLocale, className = '' }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (locale: Locale) => {
    // Remove the current locale from the pathname if it exists
    const pathWithoutLocale = pathname.replace(/^\/(en|id)/, '') || '/'
    
    // Construct the new path with the selected locale
    const newPath = locale === 'id' ? pathWithoutLocale : `/${locale}${pathWithoutLocale}`
    
    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-gray-900 dark:text-white backdrop-blur-sm border border-white/20 transition-all duration-200 ${className}`}
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">{getLocaleFlag(currentLocale)}</span>
          <span className="hidden sm:inline text-sm">{getLocaleName(currentLocale)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
      >
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
              currentLocale === locale ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getLocaleFlag(locale)}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {getLocaleName(locale)}
              </span>
            </div>
            {currentLocale === locale && (
              <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
