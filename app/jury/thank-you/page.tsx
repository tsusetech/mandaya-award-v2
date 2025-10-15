'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { 
  CheckCircle, 
  Award, 
  Trophy, 
  Star, 
  Heart, 
  Scale,
  Gavel,
  Shield
} from 'lucide-react'
import { getProfile } from '@/lib/auth'

export default function JuryThankYouPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getProfile()
        setUser(userData)
      } catch (err) {
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-yellow-400/10 to-yellow-500/10 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-yellow-500/5 to-yellow-600/5 blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Award Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 animate-bounce delay-100">
          <Gavel className="h-8 w-8 text-yellow-500/30" />
        </div>
        <div className="absolute top-32 right-16 animate-bounce delay-300">
          <Trophy className="h-10 w-10 text-yellow-600/30" />
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce delay-500">
          <Star className="h-6 w-6 text-yellow-400/30" />
        </div>
        <div className="absolute bottom-20 right-10 animate-bounce delay-700">
          <Scale className="h-7 w-7 text-yellow-500/30" />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-4xl border-0 shadow-2xl shadow-yellow-500/20 backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center space-y-6 pb-8">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg border-4 border-green-400/50 flex items-center justify-center animate-pulse">
                  <CheckCircle className="h-20 w-20 text-white" />
                </div>
                {/* Floating sparkles */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce delay-300">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-yellow-600 to-green-600 bg-clip-text text-transparent">
                Terima Kasih!
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Penilaian Anda telah berhasil disimpan
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Thank You Message */}
            <div className="text-center space-y-6">
              <div className="bg-gradient-to-r from-yellow-100 to-green-100 rounded-2xl p-8 border border-yellow-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Terhormat, {user?.name || user?.username}! 🎉
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Terima kasih atas kontribusi Anda sebagai Juri dalam <strong>Mandaya Awards 2025</strong>. 
                  Penilaian dan keputusan Anda sangat berharga untuk menentukan penerima penghargaan 
                  yang layak dan berkualitas.
                </p>
              </div>

              {/* Appreciation Message */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center space-x-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <span>Peran Penting Anda sebagai Juri</span>
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Keahlian dan integritas Anda dalam menilai setiap pengajuan telah membantu menjaga 
                  standar keunggulan <strong>Mandaya Awards</strong>. Evaluasi objektif dan profesional 
                  Anda berkontribusi besar terhadap kredibilitas penghargaan bergengsi ini.
                </p>
              </div>

              {/* Achievement Badge */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Gavel className="h-8 w-8 text-yellow-600" />
                  <span className="text-xl font-bold text-gray-800">Juri Terpercaya</span>
                  <Gavel className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-gray-700">
                  Anda adalah bagian dari panel juri terpilih yang menjaga kualitas dan integritas 
                  Mandaya Awards sebagai penghargaan bergengsi pemerintah Indonesia!
                </p>
              </div>

              {/* Next Invitation */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center space-x-2">
                  <Award className="h-6 w-6 text-orange-600" />
                  <span>Sampai Jumpa di Mandaya Awards 2026!</span>
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Kami berharap dapat bekerja sama kembali dengan Anda di <strong>Mandaya Awards 2026</strong> 
                  untuk terus mengapresiasi karya-karya terbaik bangsa Indonesia.
                </p>
              </div>
            </div>

            {/* Footer Message */}
            <div className="text-center pt-8 border-t border-gray-200">
              <p className="text-gray-600">
                <strong>Mandaya Awards</strong> - Penghargaan Bergengsi Pemerintah Indonesia
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Terima kasih atas dedikasi dan profesionalisme Anda sebagai Juri
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

