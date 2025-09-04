'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  Search,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  Wifi,
  RefreshCw,
  MessageSquare,
  Zap,
  Phone,
  Mail,
  Users
} from 'lucide-react'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'general' | 'technical' | 'process' | 'troubleshooting'
  tags: string[]
}

const faqData: FAQItem[] = [
  // General Questions
  {
    id: 'save-progress',
    question: 'Apakah saya bisa menyimpan progress dan melanjutkan nanti?',
    answer: 'Ya, sistem memiliki fitur auto-save yang menyimpan jawaban otomatis setiap 1 detik. Anda bisa logout dan login kembali untuk melanjutkan kapan saja. Progress Anda akan tersimpan di server dengan aman.',
    category: 'general',
    tags: ['auto-save', 'progress', 'logout', 'login']
  },
  {
    id: 'time-limit',
    question: 'Berapa lama waktu yang diberikan untuk menyelesaikan assessment?',
    answer: 'Biasanya Anda memiliki waktu 3 hari sejak pertama kali memulai assessment. Sistem akan menampilkan countdown timer di halaman assessment untuk membantu Anda melacak waktu yang tersisa.',
    category: 'general',
    tags: ['waktu', 'deadline', '3 hari', 'timer']
  },
  {
    id: 'change-after-submit',
    question: 'Apakah saya bisa mengubah jawaban setelah disubmit?',
    answer: 'Setelah disubmit, Anda tidak bisa mengubah jawaban kecuali ada feedback dari admin yang meminta revisi. Jika status assessment Anda berubah menjadi "Perlu Revisi", Anda bisa melakukan perbaikan dan submit ulang.',
    category: 'general',
    tags: ['submit', 'edit', 'revisi', 'feedback']
  },
  {
    id: 'internet-disconnected',
    question: 'Bagaimana jika koneksi internet terputus?',
    answer: 'Jangan khawatir! Jawaban Anda sudah tersimpan otomatis di server berkat fitur auto-save. Setelah koneksi internet kembali normal, Anda bisa melanjutkan mengisi form dari tempat terakhir.',
    category: 'general',
    tags: ['internet', 'koneksi', 'auto-save', 'offline']
  },

  // Technical Issues
  {
    id: 'file-upload-failed',
    question: 'File upload gagal, apa yang harus dilakukan?',
    answer: 'Pastikan file dalam format yang didukung (PDF, DOC, DOCX, gambar) dan ukuran tidak terlalu besar (maksimal 10MB). Coba refresh halaman dan upload ulang. Jika masih gagal, periksa koneksi internet atau coba gunakan file dengan ukuran lebih kecil.',
    category: 'technical',
    tags: ['upload', 'file', 'error', 'format', 'ukuran']
  },
  {
    id: 'page-not-loading',
    question: 'Halaman tidak loading atau error, bagaimana?',
    answer: 'Coba langkah berikut: 1) Refresh browser (F5), 2) Clear cache browser, 3) Gunakan browser lain (Chrome/Firefox), 4) Pastikan koneksi internet stabil, 5) Disable browser extensions yang mungkin mengganggu.',
    category: 'technical',
    tags: ['loading', 'error', 'browser', 'cache', 'refresh']
  },
  {
    id: 'auto-save-not-working',
    question: 'Auto-save tidak berfungsi, apakah data hilang?',
    answer: 'Jika indikator auto-save tidak muncul, coba klik tombol "Save Section" secara manual. Data biasanya sudah tersimpan di server. Untuk memastikan, coba refresh halaman - jika jawaban masih ada, berarti data tersimpan dengan baik.',
    category: 'technical',
    tags: ['auto-save', 'manual save', 'data hilang', 'refresh']
  },

  // Process Questions
  {
    id: 'feedback-timing',
    question: 'Kapan saya akan mendapat feedback dari admin?',
    answer: 'Biasanya 1-3 hari kerja setelah submit. Anda akan mendapat notifikasi email jika ada feedback atau perubahan status assessment. Anda juga bisa mengecek status terbaru di halaman "Pengajuan Saya".',
    category: 'process',
    tags: ['feedback', 'admin', 'review', 'notifikasi', 'email']
  },
  {
    id: 'revision-feedback',
    question: 'Apa yang harus dilakukan jika mendapat feedback revisi?',
    answer: 'Baca feedback dengan teliti, perbaiki jawaban sesuai saran yang diberikan, lalu klik tombol "Kirim Ulang Penilaian". Sistem akan menandai submission Anda sebagai "Resubmitted" dan akan direview ulang oleh admin.',
    category: 'process',
    tags: ['revisi', 'feedback', 'perbaikan', 'resubmit']
  },
  {
    id: 'assessment-status',
    question: 'Bagaimana cara melihat status assessment saya?',
    answer: 'Di halaman "Pengajuan Saya", Anda bisa melihat status terkini: Draf (masih mengisi), Terkirim (menunggu review), Perlu Revisi (perlu perbaikan), Disetujui (disetujui), atau Selesai (selesai).',
    category: 'process',
    tags: ['status', 'draft', 'submitted', 'approved', 'completed']
  },

  // Troubleshooting
  {
    id: 'optional-section',
    question: 'Bagian "Pengusulan Individu/Tokoh" wajib diisi?',
    answer: 'Tidak, bagian ini bersifat opsional. Anda bisa melewatinya jika tidak relevan dengan situasi organisasi Anda. Sistem akan menampilkan peringatan bahwa bagian ini opsional.',
    category: 'troubleshooting',
    tags: ['opsional', 'pengusulan', 'tokoh', 'skip']
  },
  {
    id: 'multiple-devices',
    question: 'Bolehkah saya mengisi assessment di beberapa device berbeda?',
    answer: 'Boleh, asalkan login dengan akun yang sama. Data akan tersinkronisasi otomatis antar device berkat fitur cloud sync. Pastikan logout dari device lama sebelum login di device baru untuk keamanan.',
    category: 'troubleshooting',
    tags: ['multiple device', 'sinkronisasi', 'cloud', 'login']
  },
  {
    id: 'character-limit',
    question: 'Apakah ada batasan karakter untuk jawaban text?',
    answer: 'Tidak ada batasan karakter yang ketat, tapi disarankan memberikan jawaban yang relevan dan tidak terlalu panjang. Fokus pada kualitas jawaban daripada kuantitas. Sistem dapat menangani jawaban hingga beberapa ribu karakter.',
    category: 'troubleshooting',
    tags: ['karakter', 'batasan', 'text', 'panjang jawaban']
  }
]

const categories = [
  { id: 'all', name: 'Semua', icon: HelpCircle, color: 'blue' },
  { id: 'general', name: 'Pertanyaan Umum', icon: Users, color: 'green' },
  { id: 'technical', name: 'Masalah Teknis', icon: AlertTriangle, color: 'orange' },
  { id: 'process', name: 'Proses Review', icon: CheckCircle, color: 'purple' },
  { id: 'troubleshooting', name: 'Troubleshooting', icon: RefreshCw, color: 'red' }
]

export default function FAQPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const expandAll = () => {
    setExpandedItems(new Set(filteredFAQs.map(faq => faq.id)))
  }

  const collapseAll = () => {
    setExpandedItems(new Set())
  }

  return (
    <AuthenticatedLayout allowedRoles={['PESERTA']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/5 to-pink-500/5 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-400/5 to-pink-400/5 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-purple-500/3 to-pink-500/3 blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border-b border-purple-200/50 dark:border-purple-800/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 32 32\\'><path fill=\\'%23A855F7\\' d=\\'M0 31h32v1H0zM31 0v32h1V0z\\'/></svg>')] opacity-5"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-6">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/peserta')}
                  className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali ke Beranda</span>
                </Button>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg border-2 border-purple-400/50 relative">
                    <HelpCircle className="h-8 w-8 text-white" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-400 bg-clip-text text-transparent">
                      FAQ Assessment
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Pertanyaan yang sering diajukan tentang sistem penilaian
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => router.push('/peserta/tutorial')}
                  variant="outline"
                  className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-purple-200/50 dark:border-purple-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Tutorial</span>
                </Button>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{faqData.length} FAQ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter Section */}
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
            <CardContent className="relative z-10 pt-8">
              <div className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Cari pertanyaan atau kata kunci..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-purple-400 transition-all duration-200"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-3">
                  {categories.map(({ id, name, icon: Icon, color }) => (
                    <Button
                      key={id}
                      variant={selectedCategory === id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(id)}
                      className={`flex items-center space-x-2 transition-all duration-200 ${
                        selectedCategory === id 
                          ? `bg-gradient-to-r from-${color}-600 to-${color}-500 hover:from-${color}-700 hover:to-${color}-600 text-white shadow-lg shadow-${color}-500/25 hover:shadow-${color}-500/40`
                          : `border-${color}-200/50 dark:border-${color}-800/50 hover:bg-${color}-50 dark:hover:bg-${color}-900/20`
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{name}</span>
                      {id !== 'all' && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedCategory === id 
                            ? 'bg-white/20 text-white' 
                            : `bg-${color}-100 dark:bg-${color}-900/40 text-${color}-600 dark:text-${color}-400`
                        }`}>
                          {faqData.filter(faq => faq.category === id).length}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>

                {/* Expand/Collapse All */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Menampilkan {filteredFAQs.length} dari {faqData.length} FAQ
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={expandAll}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      Buka Semua
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={collapseAll}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      Tutup Semua
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5"></div>
                <CardContent className="relative z-10 py-16">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 to-gray-700 flex items-center justify-center">
                      <Search className="h-16 w-16 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tidak ada FAQ yang ditemukan</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
                      Coba sesuaikan kata kunci pencarian atau pilih kategori lain
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('all')
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      Reset Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredFAQs.map((faq) => {
                const isExpanded = expandedItems.has(faq.id)
                const categoryInfo = categories.find(cat => cat.id === faq.category)
                
                return (
                  <Card key={faq.id} className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="relative z-10 p-0">
                      <button
                        onClick={() => toggleExpanded(faq.id)}
                        className="w-full text-left p-6 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {categoryInfo && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800 dark:bg-${categoryInfo.color}-900/40 dark:text-${categoryInfo.color}-300`}>
                                  <categoryInfo.icon className="h-3 w-3 mr-1" />
                                  {categoryInfo.name}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 pr-4">
                              {faq.question}
                            </h3>
                            {faq.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {faq.tags.slice(0, 3).map((tag, index) => (
                                  <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                    {tag}
                                  </span>
                                ))}
                                {faq.tags.length > 3 && (
                                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                    +{faq.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            {isExpanded ? (
                              <ChevronDown className="h-6 w-6 text-purple-600 dark:text-purple-400 transition-transform duration-200" />
                            ) : (
                              <ChevronRight className="h-6 w-6 text-purple-600 dark:text-purple-400 transition-transform duration-200" />
                            )}
                          </div>
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-gray-200/50 dark:border-gray-700/50">
                          <div className="pt-4">
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {faq.answer}
                              </p>
                            </div>
                            {faq.tags.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tags:</p>
                                <div className="flex flex-wrap gap-1">
                                  {faq.tags.map((tag, index) => (
                                    <span key={index} className="inline-block px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Contact Support Section */}
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden mt-12">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-200 dark:from-blue-900/40 dark:to-purple-800/40">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Masih Butuh Bantuan?</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Jika pertanyaan Anda tidak terjawab di FAQ ini, jangan ragu untuk menghubungi tim support kami.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-gray-700 dark:text-gray-300">support@example.com</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-gray-700 dark:text-gray-300">+62 xxx-xxxx-xxxx</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <span className="text-gray-700 dark:text-gray-300">Senin-Jumat, 08:00-17:00 WIB</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <Button 
                    onClick={() => router.push('/peserta/tutorial')}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 transform hover:scale-105"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Lihat Tutorial Lengkap
                  </Button>
                  <Button 
                    onClick={() => router.push('/peserta/groups')}
                    variant="outline"
                    className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-purple-200/50 dark:border-purple-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Mulai Assessment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
