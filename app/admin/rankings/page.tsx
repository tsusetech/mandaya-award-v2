'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Trophy, Medal, Award, ArrowLeft, Filter, Download, TrendingUp, BarChart3, Star, Crown } from 'lucide-react'
import api from '@/lib/api'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

interface RankingEntry {
  id: number
  groupName: string
  participantName: string
  participantEmail: string
  category: string
  nomination: string
  totalScore: number
  averageScore: number
  reviewCount: number
  rank: number
  status: 'pending' | 'in_progress' | 'completed'
  lastReviewedAt?: string
  submittedAt: string
}

interface RankingStats {
  totalSubmissions: number
  reviewedSubmissions: number
  averageScore: number
  topScore: number
  lowestScore: number
}

export default function AdminRankingsPage() {
  const router = useRouter()
  const [rankings, setRankings] = useState<RankingEntry[]>([])
  const [filteredRankings, setFilteredRankings] = useState<RankingEntry[]>([])
  const [stats, setStats] = useState<RankingStats>({
    totalSubmissions: 0,
    reviewedSubmissions: 0,
    averageScore: 0,
    topScore: 0,
    lowestScore: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRankings()
  }, [])

  useEffect(() => {
    filterRankings()
  }, [rankings, searchTerm, categoryFilter])

  const fetchRankings = async () => {
    try {
      setLoading(true)
      
      // Fetch rankings data from API
      const response = await api.get('/assessments/jury/rankings')
      const apiData = response.data.data || { categories: [] }
      
      // Extract and flatten rankings from the nested structure
      const flattenedRankings: RankingEntry[] = []
      let totalSubmissions = 0
      let reviewedSubmissions = 0
      let totalScore = 0
      let topScore = 0
      let lowestScore = Infinity
      
      if (apiData.categories && Array.isArray(apiData.categories)) {
        apiData.categories.forEach((category: { categoryName: string; rankings?: Array<{ id: number; groupName: string; participantInfo?: string; score?: number; rank: number; lastReviewedAt?: string; submittedAt?: string }> }) => {
          if (category.rankings && Array.isArray(category.rankings)) {
            category.rankings.forEach((ranking: { id: number; groupName: string; participantInfo?: string; score?: number; rank: number; lastReviewedAt?: string; submittedAt?: string }) => {
              totalSubmissions++
              reviewedSubmissions++
              totalScore += ranking.score || 0
              topScore = Math.max(topScore, ranking.score || 0)
              lowestScore = Math.min(lowestScore, ranking.score || 0)
              
              flattenedRankings.push({
                id: ranking.id,
                groupName: ranking.groupName,
                participantName: ranking.participantInfo?.split(' • ')[1] || ranking.participantInfo || '',
                participantEmail: ranking.participantInfo?.split(' • ')[2] || '',
                category: category.categoryName,
                nomination: ranking.groupName, // Use groupName as nomination for now
                totalScore: ranking.score || 0,
                averageScore: ranking.score || 0,
                reviewCount: 3, // Default value since API doesn't provide this
                rank: ranking.rank,
                status: 'completed',
                lastReviewedAt: ranking.lastReviewedAt,
                submittedAt: ranking.submittedAt || new Date().toISOString()
              })
            })
          }
        })
      }
      
      setRankings(flattenedRankings)
      setStats({
        totalSubmissions,
        reviewedSubmissions,
        averageScore: totalSubmissions > 0 ? totalScore / totalSubmissions : 0,
        topScore,
        lowestScore: lowestScore === Infinity ? 0 : lowestScore
      })
    } catch (err) {
      console.error('Error fetching rankings:', err)
      // Fallback to mock data on error
      
      // Use mock data as fallback
      const mockRankings: RankingEntry[] = [
        // Pemerintah Daerah Pendukung Pemberdayaan
        {
          id: 1,
          groupName: 'Pemerintah Provinsi Jawa Barat',
          participantName: 'Ridwan Kamil',
          participantEmail: 'ridwan.kamil@jabar.go.id',
          category: 'Pemerintah Daerah Pendukung Pemberdayaan',
          nomination: 'Provinsi Terbaik',
          totalScore: 95.5,
          averageScore: 95.5,
          reviewCount: 3,
          rank: 1,
          status: 'completed',
          submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          lastReviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          groupName: 'Pemerintah Kota Bandung',
          participantName: 'Yana Mulyana',
          participantEmail: 'yana.mulyana@bandung.go.id',
          category: 'Pemerintah Daerah Pendukung Pemberdayaan',
          nomination: 'Kota Terbaik',
          totalScore: 92.8,
          averageScore: 92.8,
          reviewCount: 3,
          rank: 1,
          status: 'completed',
          submittedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
          lastReviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          groupName: 'Pemerintah Kabupaten Bogor',
          participantName: 'Ade Yasin',
          participantEmail: 'ade.yasin@bogor.go.id',
          category: 'Pemerintah Daerah Pendukung Pemberdayaan',
          nomination: 'Kabupaten Terbaik',
          totalScore: 89.2,
          averageScore: 89.2,
          reviewCount: 3,
          rank: 1,
          status: 'completed',
          submittedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          lastReviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        // Mitra Nonpemerintah
        {
          id: 4,
          groupName: 'Yayasan Bina Swadaya',
          participantName: 'Bambang Ismawan',
          participantEmail: 'bambang.ismawan@binaswadaya.org',
          category: 'Mitra Nonpemerintah',
          nomination: 'NGO Terbaik',
          totalScore: 94.1,
          averageScore: 94.1,
          reviewCount: 3,
          rank: 1,
          status: 'completed',
          submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastReviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 5,
          groupName: 'PT Astra International',
          participantName: 'Djony Bunarto Tjondro',
          participantEmail: 'djony.tjondro@astra.co.id',
          category: 'Mitra Nonpemerintah',
          nomination: 'Korporasi Terbaik',
          totalScore: 91.7,
          averageScore: 91.7,
          reviewCount: 3,
          rank: 1,
          status: 'completed',
          submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          lastReviewedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 6,
          groupName: 'Universitas Indonesia',
          participantName: 'Prof. Ari Kuncoro',
          participantEmail: 'ari.kuncoro@ui.ac.id',
          category: 'Mitra Nonpemerintah',
          nomination: 'Akademisi Terbaik',
          totalScore: 88.9,
          averageScore: 88.9,
          reviewCount: 3,
          rank: 1,
          status: 'completed',
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          lastReviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        // Penggerak Akar Rumput
        {
          id: 7,
          groupName: 'Komunitas Tani Maju',
          participantName: 'Sukardi',
          participantEmail: 'sukardi@tanimaju.com',
          category: 'Penggerak Akar Rumput',
          nomination: 'Petani Terbaik',
          totalScore: 93.3,
          averageScore: 93.3,
          reviewCount: 3,
          rank: 1,
          status: 'completed',
          submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          lastReviewedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 8,
          groupName: 'Kelompok Wanita Tani',
          participantName: 'Siti Aminah',
          participantEmail: 'siti.aminah@kwt.org',
          category: 'Penggerak Akar Rumput',
          nomination: 'Kelompok Wanita Terbaik',
          totalScore: 90.5,
          averageScore: 90.5,
          reviewCount: 3,
          rank: 1,
          status: 'completed',
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          lastReviewedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 9,
          groupName: 'Koperasi Simpan Pinjam',
          participantName: 'Budi Santoso',
          participantEmail: 'budi.santoso@koperasi.co.id',
          category: 'Penggerak Akar Rumput',
          nomination: 'Koperasi Terbaik',
          totalScore: 87.8,
          averageScore: 87.8,
          reviewCount: 3,
          rank: 1,
          status: 'completed',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastReviewedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        // Lifetime Contribution
        {
          id: 10,
          groupName: 'Prof. Dr. Emil Salim',
          participantName: 'Prof. Dr. Emil Salim',
          participantEmail: 'emil.salim@email.com',
          category: 'Lifetime Contribution',
          nomination: 'Penghargaan Khusus',
          totalScore: 97.2,
          averageScore: 97.2,
          reviewCount: 3,
          rank: 1,
          status: 'completed',
          submittedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
          lastReviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      setRankings(mockRankings)
      setStats({
        totalSubmissions: 15,
        reviewedSubmissions: 12,
        averageScore: 85.2,
        topScore: 95.5,
        lowestScore: 72.1
      })
    } finally {
      setLoading(false)
    }
  }

  const filterRankings = () => {
    let filtered = [...rankings]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.participantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.nomination.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(entry => entry.category === categoryFilter)
    }

    // Sort by nomination first, then by rank within each nomination
    filtered.sort((a, b) => {
      if (a.nomination !== b.nomination) {
        return a.nomination.localeCompare(b.nomination)
      }
      return a.rank - b.rank
    })

    setFilteredRankings(filtered)
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <Star className="h-5 w-5 text-blue-500" />
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleExport = () => {
    console.log('Export functionality coming soon')
    // You can implement actual export functionality here
  }

  if (loading) {
    return (
      <AuthenticatedLayout allowedRoles={['ADMIN', 'SUPERADMIN']}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 -mt-16 pt-16">
          <div className="p-6 space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout allowedRoles={['ADMIN', 'SUPERADMIN']}>
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
                  onClick={() => router.push('/admin')}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-gray-900 dark:text-white backdrop-blur-sm border border-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali ke Beranda</span>
                </Button>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg border-2 border-yellow-400/50">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                      Peringkat 9 Nominasi
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Peringkat saat ini berdasarkan 4 kategori utama dengan pembaruan real-time
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-yellow-200/50 dark:border-yellow-800/50 hover:bg-white/70 dark:hover:bg-gray-700/50"
              >
                <Download className="h-4 w-4" />
                <span>Ekspor</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pengajuan</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:from-blue-200 dark:group-hover:from-blue-900/60 group-hover:to-blue-300 dark:group-hover:to-blue-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalSubmissions}</div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Semua pengajuan</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Sudah Dinilai</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 group-hover:from-green-200 dark:group-hover:from-green-900/60 group-hover:to-green-300 dark:group-hover:to-green-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.reviewedSubmissions}</div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-green-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Penilaian selesai</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Skor Rata-rata</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 group-hover:from-orange-200 dark:group-hover:from-orange-900/60 group-hover:to-orange-300 dark:group-hover:to-orange-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <Medal className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.averageScore.toFixed(1)}</div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-orange-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Rata-rata keseluruhan</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Skor Tertinggi</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 group-hover:from-yellow-200 dark:group-hover:from-yellow-900/60 group-hover:to-yellow-300 dark:group-hover:to-yellow-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <Crown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.topScore.toFixed(1)}</div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-yellow-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pencapaian tertinggi</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Cari berdasarkan nama kelompok, peserta, kategori, atau nominasi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-gray-300 focus:border-yellow-500 focus:ring-yellow-500/20 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-yellow-400 transition-all duration-200"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={categoryFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('all')}
                    className="text-xs sm:text-sm bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200"
                  >
                    Semua Kategori
                  </Button>
                  <Button
                    variant={categoryFilter === 'Pemerintah Daerah Pendukung Pemberdayaan' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('Pemerintah Daerah Pendukung Pemberdayaan')}
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Pemerintah Daerah</span>
                    <span className="sm:hidden">Pemda</span>
                  </Button>
                  <Button
                    variant={categoryFilter === 'Mitra Nonpemerintah' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('Mitra Nonpemerintah')}
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Mitra Nonpemerintah</span>
                    <span className="sm:hidden">Mitra</span>
                  </Button>
                  <Button
                    variant={categoryFilter === 'Penggerak Akar Rumput' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('Penggerak Akar Rumput')}
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Penggerak Akar Rumput</span>
                    <span className="sm:hidden">Penggerak</span>
                  </Button>
                  <Button
                    variant={categoryFilter === 'Lifetime Contribution' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('Lifetime Contribution')}
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Lifetime Contribution</span>
                    <span className="sm:hidden">Lifetime</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rankings Table */}
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40">
                  <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-gray-900 dark:text-white font-bold">Peringkat 9 Nominasi</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Aktif</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {filteredRankings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 mb-4 mx-auto w-fit">
                    <Trophy className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada peringkat ditemukan</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center">
                    {searchTerm || categoryFilter !== 'all'
                      ? 'Coba sesuaikan filter Anda'
                      : 'Belum ada pengajuan yang dinilai'}
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {(() => {
                    // Group entries by nomination
                    const groupedByNomination = filteredRankings.reduce((groups, entry) => {
                      if (!groups[entry.nomination]) {
                        groups[entry.nomination] = []
                      }
                      groups[entry.nomination].push(entry)
                      return groups
                    }, {} as Record<string, typeof filteredRankings>)

                    return Object.entries(groupedByNomination).map(([nomination, entries]) => (
                      <div key={nomination} className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{nomination}</h3>
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800">
                            {entries[0]?.category}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {entries.map((entry) => (
                            <div
                              key={entry.id}
                              className="group/item flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-yellow-100 dark:hover:from-yellow-900/20 dark:hover:to-yellow-800/20 transition-all duration-300 transform hover:scale-[1.02] gap-4"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
                                    {getRankIcon(entry.rank)}
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                      {getRankBadge(entry.rank)}
                                    </div>
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">{entry.groupName}</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                    {entry.participantName} • {entry.participantEmail}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                                <div className="text-center sm:text-right">
                                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {entry.totalScore.toFixed(1)}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Skor</div>
                                </div>
                                
                                <div className="text-center sm:text-right">
                                  <div className="text-sm text-gray-600 dark:text-gray-300">
                                    Dikirim: {formatDate(entry.submittedAt)}
                                  </div>
                                  {entry.lastReviewedAt && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      Terakhir ditinjau: {formatDate(entry.lastReviewedAt)}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-center">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/admin/submissions/${entry.id}`)}
                                    className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white border-yellow-600 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200"
                                  >
                                    <span className="hidden sm:inline">Lihat Detail</span>
                                    <span className="sm:hidden">Detail</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
