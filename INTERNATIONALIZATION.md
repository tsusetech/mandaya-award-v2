# Internationalization (i18n) Guide

This project now supports multiple languages with a comprehensive internationalization system built using `next-intl`.

## 🌍 Supported Languages

- **Indonesian (Bahasa Indonesia)** - Default language (`id`)
- **English** - Secondary language (`en`)

## 📁 File Structure

```
├── lib/
│   ├── i18n.ts                 # i18n configuration
│   └── useTranslations.ts      # Custom translation hook
├── messages/
│   ├── en.json                 # English translations
│   └── id.json                 # Indonesian translations
├── components/
│   └── LanguageSwitcher.tsx    # Language switcher component
├── app/
│   ├── [locale]/               # Internationalized routes
│   │   ├── layout.tsx          # Locale-aware layout
│   │   ├── page.tsx            # Home page
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   └── admin/
│   │       └── page.tsx        # Admin dashboard
│   ├── page.tsx                # Root redirect
│   └── globals.css
├── middleware.ts               # Locale routing middleware
└── next.config.ts              # Next.js i18n configuration
```

## 🚀 Quick Start

### 1. Using Translations in Components

```tsx
'use client'

import { useTranslations } from 'next-intl'

export default function MyComponent() {
  const t = useTranslations('common')
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}
```

### 2. Using Namespace-specific Translations

```tsx
'use client'

import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('auth')
  
  return (
    <form>
      <label>{t('email')}</label>
      <input placeholder={t('emailPlaceholder')} />
      <button>{t('signIn')}</button>
    </form>
  )
}
```

### 3. Adding Language Switcher

```tsx
'use client'

import { useLocale } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Header() {
  const locale = useLocale()
  
  return (
    <header>
      <LanguageSwitcher currentLocale={locale as any} />
    </header>
  )
}
```

## 📝 Translation Structure

Translations are organized in nested objects for better organization:

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "auth": {
    "signIn": "Sign In",
    "email": "Email",
    "password": "Password"
  },
  "dashboard": {
    "title": "Dashboard",
    "stats": {
      "users": "Total Users",
      "groups": "Total Groups"
    }
  }
}
```

## 🔧 Configuration

### Adding New Languages

1. Add the locale to `lib/i18n.ts`:
```typescript
export const locales = ['en', 'id', 'ja'] as const
```

2. Create translation file `messages/ja.json`

3. Update locale functions:
```typescript
export function getLocaleName(locale: Locale): string {
  switch (locale) {
    case 'en': return 'English'
    case 'id': return 'Bahasa Indonesia'
    case 'ja': return '日本語'
    default: return 'Unknown'
  }
}
```

### URL Structure

- **Default locale (Indonesian)**: `/` or `/id`
- **Other locales**: `/en`, `/ja`, etc.
- **Nested routes**: `/en/admin`, `/id/login`, etc.

## 🎨 Language Switcher Component

The `LanguageSwitcher` component provides:

- Flag icons for each language
- Smooth animations
- Responsive design
- Glass morphism styling
- Current language indicator

### Customization

```tsx
<LanguageSwitcher 
  currentLocale={locale} 
  className="custom-styles" 
/>
```

## 📚 Best Practices

### 1. Translation Keys

- Use descriptive, hierarchical keys
- Keep keys consistent across languages
- Use lowercase with dots for separation

```typescript
// Good
t('users.management.title')
t('auth.login.button')

// Avoid
t('userMgmtTitle')
t('loginBtn')
```

### 2. Dynamic Content

For dynamic content, use interpolation:

```typescript
// In translation file
{
  "welcome": "Welcome, {name}!"
}

// In component
t('welcome', { name: 'John' })
```

### 3. Pluralization

```typescript
// In translation file
{
  "items": {
    "one": "{count} item",
    "other": "{count} items"
  }
}

// In component
t('items', { count: 5 })
```

### 4. Date and Number Formatting

```typescript
import { useFormatter } from 'next-intl'

export default function MyComponent() {
  const format = useFormatter()
  
  return (
    <div>
      <p>{format.dateTime(new Date(), { dateStyle: 'long' })}</p>
      <p>{format.number(1234.56, { style: 'currency', currency: 'IDR' })}</p>
    </div>
  )
}
```

## 🔄 Migration Guide

### From Non-i18n to i18n

1. **Move existing pages** to `app/[locale]/` directory
2. **Replace hardcoded text** with translation keys
3. **Update imports** to use `next-intl` hooks
4. **Test both languages** thoroughly

### Example Migration

**Before:**
```tsx
export default function LoginPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <button>Login</button>
    </div>
  )
}
```

**After:**
```tsx
'use client'

import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('auth')
  
  return (
    <div>
      <h1>{t('signIn')}</h1>
      <button>{t('login')}</button>
    </div>
  )
}
```

## 🧪 Testing

### Testing Translations

1. **Switch languages** using the language switcher
2. **Verify all text** is translated correctly
3. **Check URL structure** for different locales
4. **Test fallbacks** for missing translations

### Common Issues

1. **Missing translations**: Check console for warnings
2. **URL routing**: Ensure middleware is configured correctly
3. **Client/Server mismatch**: Use `'use client'` directive when needed

## 📖 Additional Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [ICU Message Format](https://formatjs.io/docs/core-concepts/icu-syntax/)

## 🤝 Contributing

When adding new features:

1. **Add translations** for both languages
2. **Update this documentation** if needed
3. **Test with both locales**
4. **Follow naming conventions**

## 🚀 Deployment

The internationalization system works seamlessly with:

- **Vercel**: Automatic locale detection
- **Netlify**: Configure redirects for locales
- **Other platforms**: Standard Next.js deployment

No additional configuration required for most hosting platforms.
