// app/register/page.tsx
'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  name: z.string().optional(),
  password: z.string().min(6),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const { user, message } = await registerUser(data)
      toast.success(message || 'Registration successful!')
  
      // Optional: auto-login or redirect
      router.push('/login')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
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
          <label className="block font-medium">Username</label>
          <input
            type="text"
            {...register('username')}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium">Full Name (optional)</label>
          <input
            type="text"
            {...register('name')}
            className="w-full border px-3 py-2 rounded"
          />
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
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}
