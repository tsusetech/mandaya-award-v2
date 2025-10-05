'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Gavel, 
  Trophy, 
  Star, 
  Target,
  TrendingUp,
  Users,
  Zap,
  Brain,
  Award,
  MessageSquare,
  AlertTriangle,
  Send,
  RefreshCw,
  BarChart3,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { getProfile } from '@/lib/auth'

interface AwardRanking {
  id: number
  sessionId: number
  userId: number
  userEmail: string
  userName: string
  groupId: number
  groupName: string
  juryCount: number
  averageScores: {
    relevansiProgram: number
    dampakCapaianNyata: number
    inklusivitas: number
    keberlanjutan: number
    inovasiPotensiReplikasi: number
    kualitasPresentasi: number
    overall: number
  }
  scoringDetails: Array<{
    id: number
    awardRankingId: number
    juryId: number
    juryEmail: string
    juryName: string
    relevansiProgram: number
    dampakCapaianNyata: number
    inklusivitas: number
    keberlanjutan: number
    inovasiPotensiReplikasi: number
    kualitasPresentasi: number
    createdAt: string
    updatedAt: string
  }>
  createdAt: string
  updatedAt: string
}

export default function JudgmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [ranking, setRanking] = useState<AwardRanking | null>(null)
  const [scores, setScores] = useState({
    relevansiProgram: 0,
    dampakCapaianNyata: 0,
    inklusivitas: 0,
    keberlanjutan: 0,
    inovasiPotensiReplikasi: 0,
    kualitasPresentasi: 0
  })
  const [saving, setSaving] = useState(false)
  const [juryId, setJuryId] = useState<number | null>(null)

  const rankingId = params.id as string

  const fetchUserProfile = async () => {
    try {
      const user = await getProfile()
      setJuryId(user.id)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      toast.error('Gagal memuat profil pengguna')
    }
  }

  const fetchRankingDetail = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/award-rankings/${rankingId}`)
      const rankingData: AwardRanking = response.data?.data || response.data
      
      setRanking(rankingData)
      setScores({
        relevansiProgram: rankingData.averageScores.relevansiProgram,
        dampakCapaianNyata: rankingData.averageScores.dampakCapaianNyata,
        inklusivitas: rankingData.averageScores.inklusivitas,
        keberlanjutan: rankingData.averageScores.keberlanjutan,
        inovasiPotensiReplikasi: rankingData.averageScores.inovasiPotensiReplikasi,
        kualitasPresentasi: rankingData.averageScores.kualitasPresentasi
      })
    } catch (err) {
      console.error('Error fetching ranking detail:', err)
      toast.error('Gagal memuat detail penilaian')
      router.push('/jury/judgment')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalScore = (ranking: AwardRanking) => {
    return ranking.averageScores.relevansiProgram + 
           ranking.averageScores.dampakCapaianNyata + 
           ranking.averageScores.inklusivitas + 
           ranking.averageScores.keberlanjutan + 
           ranking.averageScores.inovasiPotensiReplikasi + 
           ranking.averageScores.kualitasPresentasi
  }

  const getScoringStatus = (ranking: AwardRanking) => {
    if (!ranking.scoringDetails || ranking.scoringDetails.length === 0) {
      return {
        status: 'belum',
        label: 'Belum Memberi Penilaian',
        color: 'bg-gray-100 text-gray-800',
        icon: Clock
      }
    } else {
      return {
        status: 'sudah',
        label: 'Sudah Memberi Penilaian',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      }
    }
  }

  const getScoreBadge = (ranking: AwardRanking) => {
    const scoringStatus = getScoringStatus(ranking)
    const IconComponent = scoringStatus.icon

    return (
      <Badge className={`${scoringStatus.color} flex items-center space-x-1`}>
        <IconComponent className="h-3 w-3" />
        <span>{scoringStatus.label}</span>
      </Badge>
    )
  }

  const handleScoreChange = (criterion: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [criterion]: value
    }))
  }

  const handleSubmitJudgment = async () => {
    if (!ranking) return

    try {
      setSaving(true)

      // Validate all scores are between 1-5
      const allScores = Object.values(scores)
      if (allScores.some(score => score < 1 || score > 5)) {
        toast.error('Semua skor harus antara 1-5')
        return
      }

      // Check if scoring already exists
      const hasExistingScoring = ranking.scoringDetails && ranking.scoringDetails.length > 0

      // Use different endpoints and payloads based on scoring status
      if (hasExistingScoring) {
        // Update existing scoring - only send scoring criteria
        const scoringDetailId = ranking.scoringDetails[0].id
        const updatePayload = {
          relevansiProgram: scores.relevansiProgram,
          dampakCapaianNyata: scores.dampakCapaianNyata,
          inklusivitas: scores.inklusivitas,
          keberlanjutan: scores.keberlanjutan,
          inovasiPotensiReplikasi: scores.inovasiPotensiReplikasi,
          kualitasPresentasi: scores.kualitasPresentasi
        }
        await api.patch(`/award-rankings/scoring/${scoringDetailId}`, updatePayload)
        toast.success('Penilaian berhasil diperbarui')
      } else {
        // Create new scoring - include awardRankingId and juryId
        const createPayload = {
          awardRankingId: parseInt(rankingId),
          juryId: juryId || 123, // Use actual jury ID or fallback
          relevansiProgram: scores.relevansiProgram,
          dampakCapaianNyata: scores.dampakCapaianNyata,
          inklusivitas: scores.inklusivitas,
          keberlanjutan: scores.keberlanjutan,
          inovasiPotensiReplikasi: scores.inovasiPotensiReplikasi,
          kualitasPresentasi: scores.kualitasPresentasi
        }
        await api.post('/award-rankings/scoring', createPayload)
        toast.success('Penilaian berhasil disimpan')
      }

      router.push('/jury/judgment')
    } catch (err) {
      console.error('Error submitting judgment:', err)
      toast.error('Gagal menyimpan penilaian')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (rankingId) {
      fetchUserProfile()
      fetchRankingDetail()
    }
  }, [rankingId])

  if (loading) {
    return (
      <AuthenticatedLayout allowedRoles={['JURI', 'SUPERADMIN']}>
        <div className="p-4 sm:p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  if (!ranking) {
    return (
      <AuthenticatedLayout allowedRoles={['JURI', 'SUPERADMIN']}>
        <div className="p-4 sm:p-6">
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Data tidak ditemukan</h3>
                  <p className="text-gray-500 dark:text-gray-400">Penilaian dengan ID ini tidak ditemukan</p>
                </div>
                <Button onClick={() => router.push('/jury/judgment')}>
                  Kembali ke Daftar Penilaian
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout allowedRoles={['JURI', 'SUPERADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden -mt-16 pt-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-500/5 to-yellow-600/5 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-yellow-400/5 to-yellow-500/5 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-yellow-500/3 to-yellow-600/3 blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-yellow-500/10 via-yellow-600/10 to-yellow-500/10 border-b border-yellow-200/50 dark:border-yellow-800/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 32 32\\'><path fill=\\'%23EAB308\\' d=\\'M0 31h32v1H0zM31 0v32h1V0z\\'/></svg>')] opacity-5"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/jury/judgment')}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-gray-900 dark:text-white backdrop-blur-sm border border-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali ke Daftar</span>
                </Button>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg border-2 border-yellow-400/50">
                    <Gavel className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                      Keputusan Juri
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {ranking.groupName} - {ranking.userName}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchRankingDetail()}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-gray-900 dark:text-white backdrop-blur-sm border border-white/20"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Segarkan</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Participant Info */}
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <span>Informasi Peserta</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nama Kelompok</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{ranking.groupName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nama Peserta</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{ranking.userName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                    <p className="text-gray-900 dark:text-white">{ranking.userEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Session ID</label>
                    <p className="text-gray-900 dark:text-white">{ranking.sessionId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Scoring Form */}
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <span>Formulir Penilaian Juri</span>
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Berikan penilaian 1-5 untuk setiap kriteria (1 = Sangat Buruk, 5 = Sangat Baik)
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Scoring Criteria */}
                <div className="space-y-4">
                  {/* Relevansi Program */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Target className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Relevansi Program</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Skor: {scores.relevansiProgram}/5</span>
                    </div>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Button
                          key={value}
                          variant={scores.relevansiProgram === value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleScoreChange('relevansiProgram', value)}
                          className={`w-12 h-12 ${
                            scores.relevansiProgram === value 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'border-green-300 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Dampak Capaian Nyata */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Dampak & Capaian Nyata</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Skor: {scores.dampakCapaianNyata}/5</span>
                    </div>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Button
                          key={value}
                          variant={scores.dampakCapaianNyata === value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleScoreChange('dampakCapaianNyata', value)}
                          className={`w-12 h-12 ${
                            scores.dampakCapaianNyata === value 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Inklusivitas */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Inklusivitas</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Skor: {scores.inklusivitas}/5</span>
                    </div>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Button
                          key={value}
                          variant={scores.inklusivitas === value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleScoreChange('inklusivitas', value)}
                          className={`w-12 h-12 ${
                            scores.inklusivitas === value 
                              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                              : 'border-purple-300 text-purple-600 hover:bg-purple-50'
                          }`}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Keberlanjutan */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Zap className="h-5 w-5 text-orange-600" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Keberlanjutan</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Skor: {scores.keberlanjutan}/5</span>
                    </div>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Button
                          key={value}
                          variant={scores.keberlanjutan === value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleScoreChange('keberlanjutan', value)}
                          className={`w-12 h-12 ${
                            scores.keberlanjutan === value 
                              ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                              : 'border-orange-300 text-orange-600 hover:bg-orange-50'
                          }`}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Inovasi Potensi Replikasi */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Brain className="h-5 w-5 text-indigo-600" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Inovasi & Potensi Replikasi</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Skor: {scores.inovasiPotensiReplikasi}/5</span>
                    </div>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Button
                          key={value}
                          variant={scores.inovasiPotensiReplikasi === value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleScoreChange('inovasiPotensiReplikasi', value)}
                          className={`w-12 h-12 ${
                            scores.inovasiPotensiReplikasi === value 
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                              : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                          }`}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Kualitas Presentasi */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Award className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Kualitas Presentasi</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Skor: {scores.kualitasPresentasi}/5</span>
                    </div>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Button
                          key={value}
                          variant={scores.kualitasPresentasi === value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleScoreChange('kualitasPresentasi', value)}
                          className={`w-12 h-12 ${
                            scores.kualitasPresentasi === value 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'border-red-300 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Total Score Display */}
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Total Skor (maksimal 30)</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Object.values(scores).reduce((sum, score) => sum + score, 0)}/30
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/jury/judgment')}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleSubmitJudgment}
                    disabled={saving || Object.values(scores).some(score => score === 0)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 px-8 py-3"
                  >
                    <Send className="h-4 w-4" />
                    <span>{saving ? 'Menyimpan...' : 'Simpan Penilaian'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
