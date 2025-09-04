'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { User, Lock, Eye, EyeOff, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { getProfile } from '@/lib/auth'
import api from '@/lib/api'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
})

type PasswordChangeForm = z.infer<typeof passwordChangeSchema>

interface UserProfile {
  id: number
  name?: string
  username: string
  email: string
  userRoles?: Array<{
    role?: {
      name: string
    }
    name?: string
  }>
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const profile = await getProfile()
      setUser(profile)
    } catch (err) {
      console.error('Failed to fetch profile', err)
      toast.error('Gagal memuat profil')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: PasswordChangeForm) => {
    setSaving(true)
    try {
      console.log('Sending password change request:', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      
      const response = await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      
      console.log('Password change response:', response.data)
      toast.success('Password berhasil diubah')
      reset()
    } catch (err: any) {
      console.error('Password change error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      })
      const errorMessage = err.response?.data?.message || 'Gagal mengubah password'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const getRoleName = () => {
    if (!user?.userRoles?.length) return 'PESERTA'
    return user.userRoles[0]?.role?.name || user.userRoles[0]?.name || 'PESERTA'
  }

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="p-6 space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
              <p className="text-gray-600 dark:text-gray-300">Kelola informasi akun dan keamanan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Informasi Profil</span>
                </CardTitle>
                <CardDescription>
                  Informasi dasar akun Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nama Lengkap
                    </Label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                      <span className="text-gray-900 dark:text-white">
                        {user?.name || 'Tidak diisi'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </Label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                      <span className="text-gray-900 dark:text-white font-mono">
                        {user?.username}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </Label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                      <span className="text-gray-900 dark:text-white">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </Label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                      <span className="text-gray-900 dark:text-white capitalize">
                        {getRoleName().toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-green-600" />
                  <span>Ubah Password</span>
                </CardTitle>
                <CardDescription>
                  Perbarui password akun Anda untuk keamanan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password Saat Ini
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        {...register('currentPassword')}
                        className="pr-10"
                        placeholder="Masukkan password saat ini"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password Baru
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        {...register('newPassword')}
                        className="pr-10"
                        placeholder="Masukkan password baru"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Konfirmasi Password Baru
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword')}
                        className="pr-10"
                        placeholder="Konfirmasi password baru"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Separator />

                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Ubah Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Security Tips */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200">Tips Keamanan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <li>• Minimal 8 karakter dengan kombinasi huruf dan angka</li>
                <li>• Jangan bagikan password dengan siapapun</li>
                <li>• Gunakan password yang berbeda untuk setiap akun</li>
                <li>• Perbarui password secara berkala</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
