'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

const forgotPasswordSchema = z.object({
  email: z.string().email('Alamat email tidak valid'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', {
        email: data.email,
      })
      
      setUserEmail(data.email)
      setEmailSent(true)
      reset()
      toast.success('Email reset password telah dikirim')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Gagal mengirim email reset password'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/login')
  }

  const handleResendEmail = () => {
    if (userEmail) {
      onSubmit({ email: userEmail })
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-500/5 to-yellow-600/5 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-yellow-400/5 to-yellow-500/5 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-yellow-500/3 to-yellow-600/3 blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 32 32\\'><path fill=\\'%23EAB308\\' d=\\'M0 31h32v1H0zM31 0v32h1V0z\\'/></svg>')] opacity-5"></div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-lg border-0 shadow-2xl shadow-black/50 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
            <CardHeader className="space-y-6 text-center">
              {/* Logo Container */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg border-2 border-yellow-400/50 flex items-center justify-center animate-pulse">
                    <img src="/logo.png" alt="Mandaya Award Logo" className="w-16 h-16 rounded-full" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
              </div>

              {/* Success Icon */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>

              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                  Email Terkirim!
                </h1>
                <CardDescription className="text-lg text-gray-600 dark:text-gray-300 flex items-center justify-center space-x-2">
                  <Mail className="h-5 w-5 text-yellow-500" />
                  <span>Instruksi reset password telah dikirim</span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Email dikirim ke:
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {userEmail}
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full h-12 border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                disabled={loading}
              >
                {loading ? 'Mengirim...' : 'Kirim Ulang Email'}
              </Button>
              
              <Button
                onClick={handleBackToLogin}
                className="w-full h-12 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-semibold shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Kembali ke Login
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Tidak menerima email?</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Periksa folder spam/junk</li>
                    <li>• Pastikan alamat email benar</li>
                    <li>• Tunggu beberapa menit</li>
                    <li>• Token berlaku selama 1 jam</li>
                  </ul>
                </div>
              </div>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-500/5 to-yellow-600/5 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-yellow-400/5 to-yellow-500/5 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-yellow-500/3 to-yellow-600/3 blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 32 32\\'><path fill=\\'%23EAB308\\' d=\\'M0 31h32v1H0zM31 0v32h1V0z\\'/></svg>')] opacity-5"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg border-0 shadow-2xl shadow-black/50 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
          <CardHeader className="space-y-6 text-center">
            {/* Logo Container */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg border-2 border-yellow-400/50 flex items-center justify-center animate-pulse">
                  <img src="/logo.png" alt="Mandaya Award Logo" className="w-16 h-16 rounded-full" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
            </div>

            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                Lupa Password?
              </h1>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300 flex items-center justify-center space-x-2">
                <Mail className="h-5 w-5 text-yellow-500" />
                <span>Kami akan mengirim instruksi reset password</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="pl-12 h-12 border-gray-300 focus:border-yellow-500 focus:ring-yellow-500/20 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-yellow-400 transition-all duration-200"
                    placeholder="Masukkan email Anda"
                  />
                  {errors.email && (
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-semibold shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mengirim...
                  </>
                ) : (
                  'Kirim Email Reset Password'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={handleBackToLogin}
                className="text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
