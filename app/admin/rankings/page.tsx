'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Trophy, Medal, Award, ArrowLeft, Filter, Download } from 'lucide-react'
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
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <Award className="h-5 w-5 text-blue-500" />
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
        <div className="p-4 sm:p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">9 Nominasi Rankings</h1>
              <p className="text-sm sm:text-base text-gray-600">Current standings based on 4 main categories</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center space-x-2 self-start sm:self-auto"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Submissions</CardTitle>
              <Award className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalSubmissions}</div>
              <p className="text-xs text-gray-500 mt-1">All submissions</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Reviewed</CardTitle>
              <Trophy className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.reviewedSubmissions}</div>
              <p className="text-xs text-gray-500 mt-1">Completed reviews</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Average Score</CardTitle>
              <Medal className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}</div>
              <p className="text-xs text-gray-500 mt-1">Overall average</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Top Score</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.topScore.toFixed(1)}</div>
              <p className="text-xs text-gray-500 mt-1">Highest achieved</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by group name, participant, category, or nomination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={categoryFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('all')}
                  className="text-xs sm:text-sm"
                >
                  All Categories
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
        <Card>
          <CardHeader>
            <CardTitle>9 Nominasi Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRankings.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No rankings found</p>
                <p className="text-sm text-gray-400">
                  {searchTerm || categoryFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No submissions have been ranked yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
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
                    <div key={nomination} className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{nomination}</h3>
                        <Badge variant="outline" className="text-xs">
                          {entries[0]?.category}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-3"
                          >
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <div className="flex items-center space-x-2">
                                {getRankIcon(entry.rank)}
                                <span className="text-base sm:text-lg font-bold text-gray-900">#{entry.rank}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{entry.groupName}</h3>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">
                                  {entry.participantName} • {entry.participantEmail}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                              <div className="text-left sm:text-right">
                                <div className="text-base sm:text-lg font-bold text-gray-900">
                                  {entry.totalScore.toFixed(1)}
                                </div>
                              </div>
                              
                              <div className="text-left sm:text-right">
                                <div className="text-xs sm:text-sm text-gray-600">
                                  Submitted: {formatDate(entry.submittedAt)}
                                </div>
                                {entry.lastReviewedAt && (
                                  <div className="text-xs sm:text-sm text-gray-500">
                                    Last reviewed: {formatDate(entry.lastReviewedAt)}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/admin/submissions/${entry.id}`)}
                                  className="text-xs sm:text-sm"
                                >
                                  <span className="hidden sm:inline">View Details</span>
                                  <span className="sm:hidden">Details</span>
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
    </AuthenticatedLayout>
  )
}
