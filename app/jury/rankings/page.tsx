'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Search, 
  FileText, 
  Trophy, 
  Star, 
  Target,
  TrendingUp,
  Users,
  Zap,
  Brain,
  Award,
  MessageSquare,
  RefreshCw,
  BarChart3,
  Activity,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

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

interface AwardRankingsData {
  data: AwardRanking[]
}

export default function JuryRankingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [groupFilter, setGroupFilter] = useState('all')
  const [rankings, setRankings] = useState<AwardRanking[]>([])
  const [allGroups, setAllGroups] = useState<string[]>([])

  const extractGroupsFromRankings = (rankings: AwardRanking[]) => {
    const uniqueGroups = [...new Set(rankings.map(ranking => ranking.groupName))]
    
    // Define the proper order of groups as per the system
    const groupOrder = [
      'Provinsi',
      'Kabupaten', 
      'Kota',
      'Desa',
      'Perguruan Tinggi',
      'LSM/Organisasi Masyarakat',
      'BUMN/Swasta',
      'Individu',
      'Lifetime Contribution'
    ]
    
    // Sort groups according to the predefined order
    return uniqueGroups.sort((a, b) => {
      const indexA = groupOrder.indexOf(a)
      const indexB = groupOrder.indexOf(b)
      
      // If both groups are in the order list, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB
      }
      
      // If only one is in the list, prioritize it
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1
      
      // If neither is in the list, sort alphabetically
      return a.localeCompare(b)
    })
  }

  const fetchRankings = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      
      // Use the award-rankings endpoint with pagination parameters
      const params = new URLSearchParams()
      params.append('limit', '100') // Increase limit to get more results
      params.append('page', '1')
      
      const response = await api.get(`/award-rankings?${params.toString()}`)
      const rankingsData: AwardRankingsData = response.data || { data: [] }
      
      setRankings(rankingsData.data)
      // Extract unique group names from rankings
      setAllGroups(extractGroupsFromRankings(rankingsData.data))
    } catch (err) {
      console.error('Error fetching award rankings:', err)
      toast.error('Gagal memuat data peringkat')
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchRankings(true)
  }, [])

  // Get all group names for tabs (fetched from admin groups API)
  const getUniqueGroups = () => {
    return allGroups
  }

  // Filter rankings based on selected group and search term
  const filteredRankings = rankings.filter(ranking => {
    // Group filter
    const matchesGroup = groupFilter === 'all' || ranking.groupName === groupFilter
    
    // Search filter
    const matchesSearch = !searchTerm || 
      ranking.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ranking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ranking.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesGroup && matchesSearch
  })

  const calculateWeightedScore = (ranking: AwardRanking) => {
    // Define weights for each criterion (as percentages)
    const weights = {
      relevansiProgram: 0.15,      // 15%
      dampakCapaianNyata: 0.20,    // 20%
      inklusivitas: 0.15,          // 15%
      keberlanjutan: 0.15,         // 15%
      inovasiPotensiReplikasi: 0.20, // 20%
      kualitasPresentasi: 0.15     // 15%
    }

    // Calculate weighted score (each score out of 5, weighted by percentage)
    const weightedScore = 
      (ranking.averageScores.relevansiProgram * weights.relevansiProgram) +
      (ranking.averageScores.dampakCapaianNyata * weights.dampakCapaianNyata) +
      (ranking.averageScores.inklusivitas * weights.inklusivitas) +
      (ranking.averageScores.keberlanjutan * weights.keberlanjutan) +
      (ranking.averageScores.inovasiPotensiReplikasi * weights.inovasiPotensiReplikasi) +
      (ranking.averageScores.kualitasPresentasi * weights.kualitasPresentasi)

    return weightedScore
  }

  const calculateTotalScore = (ranking: AwardRanking) => {
    return ranking.averageScores.relevansiProgram + 
           ranking.averageScores.dampakCapaianNyata + 
           ranking.averageScores.inklusivitas + 
           ranking.averageScores.keberlanjutan + 
           ranking.averageScores.inovasiPotensiReplikasi + 
           ranking.averageScores.kualitasPresentasi
  }

  const getScoreBadge = (ranking: AwardRanking) => {
    const weightedScore = calculateWeightedScore(ranking)
    const maxWeightedScore = 5 // Maximum possible weighted score (all criteria at 5)
    
    let color = 'bg-gray-100 text-gray-800'
    let icon = BarChart3
    
    if (weightedScore >= 4.0) {
      color = 'bg-green-100 text-green-800'
      icon = Trophy
    } else if (weightedScore >= 3.0) {
      color = 'bg-blue-100 text-blue-800'
      icon = Star
    } else if (weightedScore >= 2.0) {
      color = 'bg-yellow-100 text-yellow-800'
      icon = TrendingUp
    } else if (weightedScore > 0) {
      color = 'bg-orange-100 text-orange-800'
      icon = Activity
    }

    const IconComponent = icon
    const percentage = Math.round((weightedScore / maxWeightedScore) * 100)

    return (
      <Badge className={`${color} flex items-center space-x-1`}>
        <IconComponent className="h-3 w-3" />
        <span>{weightedScore.toFixed(2)}/{maxWeightedScore} ({percentage}%)</span>
      </Badge>
    )
  }

  // Sort rankings by weighted score (highest first)
  const sortedRankings = [...filteredRankings].sort((a, b) => calculateWeightedScore(b) - calculateWeightedScore(a))

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
                  onClick={() => router.push('/jury')}
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
                      Peringkat Penilaian
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Lihat peringkat berdasarkan total skor penilaian
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                  onClick={() => fetchRankings(true)}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-gray-900 dark:text-white backdrop-blur-sm border border-white/20"
              >
                  <RefreshCw className="h-4 w-4" />
                  <span>Segarkan</span>
              </Button>
                <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {filteredRankings.length} Peserta
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Search and Filter */}
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40">
                    <Filter className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter & Pencarian</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cari dan filter peringkat berdasarkan kelompok</p>
                </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Cari berdasarkan nama kelompok, peserta, atau email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base border-gray-300 focus:border-yellow-500 focus:ring-yellow-500/20"
                  />
                </div>
                
                {/* Group Filters */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter berdasarkan Kelompok</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {/* All Groups Button */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  <Button
                        variant={groupFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                        onClick={() => setGroupFilter('all')}
                        className={`px-4 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                          groupFilter === 'all' 
                            ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white shadow-lg shadow-yellow-500/25' 
                            : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400'
                        }`}
                      >
                        Semua Kelompok
                  </Button>
                      {getUniqueGroups().map((groupName) => (
                  <Button
                          key={groupName}
                          variant={groupFilter === groupName ? 'default' : 'outline'}
                    size="sm"
                          onClick={() => setGroupFilter(groupName)}
                          className={`px-4 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                            groupFilter === groupName 
                              ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white shadow-lg shadow-yellow-500/25' 
                              : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400'
                          }`}
                        >
                          {groupName}
                  </Button>
                      ))}
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>

            {/* Rankings List */}
            <div className="grid gap-6">
              {sortedRankings.length === 0 ? (
                <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardContent className="pt-6 text-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tidak ada peringkat</h3>
                        <p className="text-gray-500 dark:text-gray-400">Belum ada penilaian yang tersedia</p>
                </div>
                  </div>
                  </CardContent>
                </Card>
              ) : (
                sortedRankings.map((ranking, index) => (
                  <Card
                    key={ranking.id}
                    className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="pt-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          {/* Ranking Position */}
                          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40">
                            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                              #{index + 1}
                            </span>
                                  </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{ranking.groupName}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4" />
                                <span>Peserta: {ranking.userName}</span>
                                    </div>
                              <div className="flex items-center space-x-2">
                                <MessageSquare className="h-4 w-4" />
                                <span>{ranking.userEmail}</span>
                                  </div>
                                </div>
                            {/* Scoring Criteria with Weighted Calculations */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                              <div className="flex items-center space-x-2 text-xs">
                                <Target className="h-3 w-3 text-green-600" />
                                <span>Relevansi: {(ranking.averageScores.relevansiProgram * 0.15).toFixed(2)}</span>
                                </div>
                              <div className="flex items-center space-x-2 text-xs">
                                <TrendingUp className="h-3 w-3 text-blue-600" />
                                <span>Dampak: {(ranking.averageScores.dampakCapaianNyata * 0.20).toFixed(2)}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs">
                                <Users className="h-3 w-3 text-purple-600" />
                                <span>Inklusivitas: {(ranking.averageScores.inklusivitas * 0.15).toFixed(2)}</span>
                                  </div>
                              <div className="flex items-center space-x-2 text-xs">
                                <Zap className="h-3 w-3 text-orange-600" />
                                <span>Keberlanjutan: {(ranking.averageScores.keberlanjutan * 0.15).toFixed(2)}</span>
                                </div>
                              <div className="flex items-center space-x-2 text-xs">
                                <Brain className="h-3 w-3 text-indigo-600" />
                                <span>Inovasi: {(ranking.averageScores.inovasiPotensiReplikasi * 0.20).toFixed(2)}</span>
                                  </div>
                              <div className="flex items-center space-x-2 text-xs">
                                <Award className="h-3 w-3 text-red-600" />
                                <span>Presentasi: {(ranking.averageScores.kualitasPresentasi * 0.15).toFixed(2)}</span>
                                </div>
                                </div>
                              </div>
                            </div>
                        <div className="flex items-center space-x-4">
                          {getScoreBadge(ranking)}
                        </div>
                      </div>
            </CardContent>
          </Card>
                    ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}