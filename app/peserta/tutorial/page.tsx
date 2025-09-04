'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  BookOpen,
  Play,
  Save,
  Send,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Users,
  Target,
  HelpCircle,
  Lightbulb,
  Zap,
  Eye,
  MessageSquare
} from 'lucide-react'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function TutorialPage() {
  const router = useRouter()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <AuthenticatedLayout allowedRoles={['PESERTA']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-400/5 to-purple-400/5 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-blue-500/3 to-purple-500/3 blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border-b border-blue-200/50 dark:border-blue-800/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 32 32\\'><path fill=\\'%233B82F6\\' d=\\'M0 31h32v1H0zM31 0v32h1V0z\\'/></svg>')] opacity-5"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-6">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/peserta')}
                  className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali ke Beranda</span>
                </Button>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg border-2 border-blue-400/50 relative">
                    <BookOpen className="h-8 w-8 text-white" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 bg-clip-text text-transparent">
                      Tutorial Assessment
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Panduan lengkap untuk menyelesaikan penilaian Anda
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => router.push('/peserta/faq')}
                  variant="outline"
                  className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-blue-200/50 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>FAQ</span>
                </Button>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Tutorial Lengkap</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Table of Contents */}
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-200 dark:from-blue-900/40 dark:to-purple-800/40">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Daftar Isi</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'persiapan', title: '1. Persiapan Sebelum Memulai', icon: Lightbulb },
                  { id: 'memulai', title: '2. Memulai Assessment', icon: Play },
                  { id: 'mengisi-form', title: '3. Mengisi Form Assessment', icon: FileText },
                  { id: 'jenis-pertanyaan', title: '4. Jenis-jenis Pertanyaan', icon: HelpCircle },
                  { id: 'fitur-khusus', title: '5. Fitur Khusus Sistem', icon: Zap },
                  { id: 'submit-review', title: '6. Submit & Review Process', icon: Send }
                ].map(({ id, title, icon: Icon }) => (
                  <Button
                    key={id}
                    variant="ghost"
                    onClick={() => scrollToSection(id)}
                    className="flex items-center justify-start space-x-3 h-auto p-4 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                  >
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tutorial Sections */}
          <div className="space-y-8">
            {/* Section 1: Persiapan */}
            <section id="persiapan">
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-800/40">
                      <Lightbulb className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">1. Persiapan Sebelum Memulai</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Checklist Persiapan:</h3>
                      <div className="space-y-3">
                        {[
                          'Pastikan koneksi internet stabil',
                          'Siapkan dokumen pendukung yang diperlukan',
                          'Login dengan akun yang telah diberikan',
                          'Baca instruksi dengan teliti',
                          'Pastikan browser mendukung upload file'
                        ].map((item, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Tips Penting:</h4>
                          <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                            <li>• Anda memiliki waktu 3 hari untuk menyelesaikan assessment</li>
                            <li>• Sistem akan menyimpan jawaban secara otomatis</li>
                            <li>• Pastikan email Anda aktif untuk notifikasi</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Section 2: Memulai Assessment */}
            <section id="memulai">
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-800/40">
                      <Play className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">2. Memulai Assessment</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Langkah-langkah:</h3>
                    <div className="space-y-4">
                      {[
                        { step: 1, title: 'Akses Dashboard Peserta', desc: 'Login ke sistem dan masuk ke halaman beranda peserta' },
                        { step: 2, title: 'Pilih Kelompok Assessment', desc: 'Klik pada kelompok yang telah ditugaskan kepada Anda' },
                        { step: 3, title: 'Mulai atau Lanjutkan', desc: 'Klik tombol "Mulai Assessment" atau "Lanjutkan" jika sudah pernah dimulai' },
                        { step: 4, title: 'Sistem Membuat Session', desc: 'Sistem otomatis membuat atau memuat session assessment Anda' }
                      ].map(({ step, title, desc }) => (
                        <div key={step} className="flex space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {step}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Section 3: Mengisi Form */}
            <section id="mengisi-form">
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/40 dark:to-pink-800/40">
                      <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">3. Mengisi Form Assessment</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Cara Navigasi:</h3>
                      <div className="space-y-3">
                        {[
                          { icon: Users, text: 'Gunakan tombol section di atas untuk berpindah bagian' },
                          { icon: Save, text: 'Jawaban tersimpan otomatis setiap 1 detik' },
                          { icon: Target, text: 'Lihat progress completion per section' },
                          { icon: Eye, text: 'Gunakan tombol "Bagian Berikutnya" untuk melanjutkan' }
                        ].map(({ icon: Icon, text }, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <Icon className="h-5 w-5 text-purple-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                      <div className="flex items-start space-x-3">
                        <Clock className="h-6 w-6 text-purple-500 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Auto-Save Feature:</h4>
                          <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                            <li>• Jawaban tersimpan otomatis setiap 1 detik</li>
                            <li>• Indikator "Auto-saving..." dan "Auto-saved" akan muncul</li>
                            <li>• Aman untuk logout dan login kembali</li>
                            <li>• Progress tetap tersimpan di server</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Section 4: Jenis Pertanyaan */}
            <section id="jenis-pertanyaan">
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-red-200 dark:from-orange-900/40 dark:to-red-800/40">
                      <HelpCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">4. Jenis-jenis Pertanyaan</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { 
                        type: 'Text Open', 
                        desc: 'Jawaban panjang untuk penjelasan detail',
                        example: 'Jelaskan program pemberdayaan masyarakat...',
                        icon: FileText,
                        color: 'blue'
                      },
                      { 
                        type: 'Text Short', 
                        desc: 'Jawaban singkat seperti nama, alamat',
                        example: 'Nama organisasi Anda',
                        icon: FileText,
                        color: 'green'
                      },
                      { 
                        type: 'Multiple Choice', 
                        desc: 'Pilih satu dari beberapa opsi',
                        example: 'Pilih provinsi, kategori organisasi',
                        icon: Target,
                        color: 'purple'
                      },
                      { 
                        type: 'Checkbox', 
                        desc: 'Pilih beberapa jawaban sekaligus',
                        example: 'Pilih semua yang sesuai + opsi lainnya',
                        icon: CheckCircle,
                        color: 'orange'
                      },
                      { 
                        type: 'File Upload', 
                        desc: 'Upload dokumen pendukung',
                        example: 'PDF, DOC, gambar ke cloud storage',
                        icon: Upload,
                        color: 'red'
                      },
                      { 
                        type: 'Email & Date', 
                        desc: 'Input email dan tanggal',
                        example: 'Email otomatis terisi, pilih tanggal',
                        icon: MessageSquare,
                        color: 'indigo'
                      }
                    ].map(({ type, desc, example, icon: Icon, color }) => (
                      <div key={type} className={`p-6 bg-gradient-to-r from-${color}-50 to-${color}-100 dark:from-${color}-900/20 dark:to-${color}-800/20 rounded-xl border border-${color}-200/50 dark:border-${color}-800/50`}>
                        <div className="flex items-center space-x-3 mb-4">
                          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
                          <h4 className={`font-semibold text-${color}-800 dark:text-${color}-300`}>{type}</h4>
                        </div>
                        <p className={`text-sm text-${color}-700 dark:text-${color}-400 mb-2`}>{desc}</p>
                        <p className={`text-xs text-${color}-600 dark:text-${color}-500 italic`}>Contoh: {example}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Section 5: Fitur Khusus */}
            <section id="fitur-khusus">
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-cyan-500/5"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-200 dark:from-indigo-900/40 dark:to-cyan-800/40">
                      <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">5. Fitur Khusus Sistem</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        title: 'Auto-Save',
                        desc: 'Jawaban tersimpan otomatis setiap 1 detik tanpa perlu klik save manual',
                        features: ['Indikator "Auto-saving..." dan "Auto-saved"', 'Tidak khawatir kehilangan data', 'Bisa logout dan login kembali']
                      },
                      {
                        title: 'URL/Bukti Pendukung',
                        desc: 'Beberapa pertanyaan memiliki field tambahan untuk URL bukti pendukung',
                        features: ['Field terpisah untuk link/URL', 'Mendukung bukti pendukung online', 'Validasi format URL otomatis']
                      },
                      {
                        title: 'Pre-fill Email',
                        desc: 'Field email otomatis terisi dengan email login Anda',
                        features: ['Email login otomatis terdeteksi', 'Dapat diubah jika diperlukan', 'Konsistensi data terjamin']
                      },
                      {
                        title: 'Section Navigation',
                        desc: 'Navigasi mudah antar bagian dengan progress tracking',
                        features: ['Progress per section (contoh: 5/10)', 'Tombol navigasi yang intuitif', 'Indikator completion status']
                      }
                    ].map(({ title, desc, features }) => (
                      <div key={title} className="p-6 bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
                        <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">{title}</h4>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-3">{desc}</p>
                        <ul className="space-y-1">
                          {features.map((feature, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-xs text-indigo-600 dark:text-indigo-400">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Section 6: Submit & Review */}
            <section id="submit-review">
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-teal-500/5"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-teal-200 dark:from-green-900/40 dark:to-teal-800/40">
                      <Send className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">6. Submit & Review Process</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Proses Submit:</h3>
                        <div className="space-y-3">
                          {[
                            { step: 1, text: 'Lengkapi semua bagian yang diperlukan' },
                            { step: 2, text: 'Klik tombol "Kirim Penilaian" di bagian terakhir' },
                            { step: 3, text: 'Sistem akan validasi kelengkapan jawaban' },
                            { step: 4, text: 'Konfirmasi submit dan tunggu review admin' }
                          ].map(({ step, text }) => (
                            <div key={step} className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                {step}
                              </div>
                              <span className="text-gray-700 dark:text-gray-300">{text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Status Assessment:</h3>
                        <div className="space-y-3">
                          {[
                            { status: 'Draf', desc: 'Masih dalam proses pengisian', color: 'gray' },
                            { status: 'Terkirim', desc: 'Telah dikirim, menunggu review', color: 'blue' },
                            { status: 'Perlu Revisi', desc: 'Perlu perbaikan sesuai feedback', color: 'orange' },
                            { status: 'Disetujui', desc: 'Disetujui dan lanjut ke tahap berikutnya', color: 'green' }
                          ].map(({ status, desc, color }) => (
                            <div key={status} className={`p-3 bg-${color}-50 dark:bg-${color}-900/20 rounded-lg border border-${color}-200/50 dark:border-${color}-800/50`}>
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 bg-${color}-500 rounded-full`}></div>
                                <div>
                                  <span className={`font-medium text-${color}-800 dark:text-${color}-300`}>{status}</span>
                                  <p className={`text-xs text-${color}-600 dark:text-${color}-400 mt-1`}>{desc}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Important Notes */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Catatan Penting:</h4>
                          <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                            <li>• Bagian "Pengusulan Individu/Tokoh" bersifat opsional</li>
                            <li>• Setelah submit, Anda tidak bisa mengubah jawaban kecuali ada feedback revisi</li>
                            <li>• Waktu review admin biasanya 1-3 hari kerja</li>
                            <li>• Anda akan mendapat notifikasi email jika ada update status</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              onClick={() => router.push('/peserta/faq')}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 transform hover:scale-105 px-8 py-3"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="font-semibold">Lihat FAQ</span>
            </Button>
            <Button 
              onClick={() => router.push('/peserta/groups')}
              variant="outline"
              className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-blue-200/50 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-8 py-3"
            >
              <Play className="h-5 w-5" />
              <span className="font-semibold">Mulai Assessment</span>
            </Button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
