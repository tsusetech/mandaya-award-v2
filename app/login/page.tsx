// app/login/page.tsx
'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const { user } = await loginUser(data.email, data.password)
      toast.success('Login successful')
  
      const redirect = localStorage.getItem('redirectAfterLogin')
      localStorage.removeItem('redirectAfterLogin')
  
      if (redirect) {
        router.push(redirect)
      } else {
        const role = user.userRoles?.[0]?.role?.name || 'PESERTA'
        if (role === 'ADMIN' || role === 'SUPERADMIN') {
          router.push('/admin')
        } else if (role === 'JURY') {
          router.push('/jury')
        } else {
          router.push('/peserta')
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium">Password</label>
          <input
            type="password"
            {...register('password')}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
