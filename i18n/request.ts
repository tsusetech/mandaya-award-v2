import { getRequestConfig } from 'next-intl/server'
import { locales } from '@/lib/i18n'

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) locale = 'id'

  return {
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
