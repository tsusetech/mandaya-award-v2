export const locales = ['en', 'id'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'id' // Default to Indonesian since it's an Indonesian government system

export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return 'ltr' // Both English and Indonesian are left-to-right
}

export function getLocaleName(locale: Locale): string {
  switch (locale) {
    case 'en':
      return 'English'
    case 'id':
      return 'Bahasa Indonesia'
    default:
      return 'Unknown'
  }
}

export function getLocaleFlag(locale: Locale): string {
  switch (locale) {
    case 'en':
      return '🇺🇸'
    case 'id':
      return '🇮🇩'
    default:
      return '🌐'
  }
}
