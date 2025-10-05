'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Search, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Star, 
  RefreshCw,
  TrendingUp,
  Activity,
  Zap,
  Users,
  BarChart3,
  Eye,
  Play,
  Target,
  Trophy,
  Brain,
  Filter,
  Award,
  MessageSquare,
  Scale,
  Gavel,
  ThumbsUp,
  ThumbsDown,
  Send,
  XCircle
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

export default function JuryJudgmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [groupFilter, setGroupFilter] = useState('all')
  const [rankings, setRankings] = useState<AwardRanking[]>([])
  const [allGroups, setAllGroups] = useState<string[]>([])
  const [selectedRanking, setSelectedRanking] = useState<AwardRanking | null>(null)
  const [judgmentScore, setJudgmentScore] = useState<number>(0)
  const [judgmentComments, setJudgmentComments] = useState('')
  const [judgmentDecision, setJudgmentDecision] = useState<'approved' | 'rejected' | 'needs_revision'>('approved')
  const [saving, setSaving] = useState(false)

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
      
      // Use the award-rankings endpoint
      const response = await api.get('/award-rankings')
      const rankingsData: AwardRankingsData = response.data || { data: [] }
      
      setRankings(rankingsData.data)
      // Extract unique group names from rankings
      setAllGroups(extractGroupsFromRankings(rankingsData.data))
    } catch (err) {
      console.error('Error fetching award rankings:', err)
      toast.error('Gagal memuat data penilaian')
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

  const handleSubmitJudgment = async () => {
    if (!selectedRanking) return

    try {
      setSaving(true)

      const judgmentPayload = {
        sessionId: selectedRanking.sessionId,
        decision: judgmentDecision,
        score: judgmentScore,
        comments: judgmentComments,
        stage: 'final_judgment'
      }

      await api.post(`/assessments/jury/${selectedRanking.sessionId}/judgment`, judgmentPayload)

      toast.success('Keputusan berhasil dikirim')
      setSelectedRanking(null)
      fetchRankings() // Refresh the list
    } catch (err) {
      console.error('Error submitting judgment:', err)
      toast.error('Gagal mengirim keputusan')
    } finally {
      setSaving(false)
    }
  }

  const openJudgmentModal = (ranking: AwardRanking) => {
    setSelectedRanking(ranking)
    setJudgmentScore(calculateTotalScore(ranking))
    setJudgmentComments('')
    setJudgmentDecision('approved')
  }

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
                    <Gavel className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                      Keputusan Juri
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Berikan keputusan akhir dan penilaian terakhir
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
                  <Scale className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {filteredRankings.length} Pengajuan
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cari dan filter pengajuan berdasarkan kelompok</p>
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
              {filteredRankings.length === 0 ? (
                <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardContent className="pt-6 text-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tidak ada penilaian</h3>
                        <p className="text-gray-500 dark:text-gray-400">Belum ada penilaian yang tersedia untuk ditinjau</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredRankings.map((ranking) => (
                  <Card
                    key={ranking.id}
                    className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="pt-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40">
                            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                          <Button
                            onClick={() => router.push(`/jury/judgment/${ranking.id}`)}
                            className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200 transform hover:scale-105 px-6 py-3"
                          >
                            <Gavel className="h-5 w-5" />
                            <span className="font-semibold">Beri Keputusan</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Judgment Modal */}
        {selectedRanking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200">
                    <Gavel className="h-6 w-6 text-yellow-600" />
                  </div>
                  <span>Keputusan Juri - {selectedRanking.groupName}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Scores Display */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Skor Penilaian Saat Ini</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Relevansi Program:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedRanking.averageScores.relevansiProgram}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Dampak & Capaian Nyata:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedRanking.averageScores.dampakCapaianNyata}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Inklusivitas:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedRanking.averageScores.inklusivitas}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Keberlanjutan:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedRanking.averageScores.keberlanjutan}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Inovasi & Potensi Replikasi:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedRanking.averageScores.inovasiPotensiReplikasi}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Kualitas Presentasi:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedRanking.averageScores.kualitasPresentasi}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-gray-700 dark:text-gray-300">Total Skor:</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{calculateTotalScore(selectedRanking)}/600</span>
                    </div>
                  </div>
                </div>

                {/* Decision Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Keputusan</label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={judgmentDecision === 'approved' ? 'default' : 'outline'}
                      onClick={() => setJudgmentDecision('approved')}
                      className={judgmentDecision === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 text-green-600 hover:bg-green-50'}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Disetujui
                    </Button>
                    <Button
                      variant={judgmentDecision === 'rejected' ? 'default' : 'outline'}
                      onClick={() => setJudgmentDecision('rejected')}
                      className={judgmentDecision === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'border-red-300 text-red-600 hover:bg-red-50'}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Ditolak
                    </Button>
                    <Button
                      variant={judgmentDecision === 'needs_revision' ? 'default' : 'outline'}
                      onClick={() => setJudgmentDecision('needs_revision')}
                      className={judgmentDecision === 'needs_revision' ? 'bg-orange-600 hover:bg-orange-700' : 'border-orange-300 text-orange-600 hover:bg-orange-50'}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Perlu Revisi
                    </Button>
                  </div>
                </div>

                {/* Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skor Akhir (0-100)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={judgmentScore}
                    onChange={(e) => setJudgmentScore(Number(e.target.value))}
                    placeholder="Masukkan skor akhir"
                  />
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Komentar Keputusan
                  </label>
                  <Textarea
                    value={judgmentComments}
                    onChange={(e) => setJudgmentComments(e.target.value)}
                    placeholder="Berikan komentar dan alasan keputusan Anda..."
                    className="min-h-[120px]"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRanking(null)}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleSubmitJudgment}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600"
                  >
                    <Send className="h-4 w-4" />
                    <span>{saving ? 'Mengirim...' : 'Kirim Keputusan'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
