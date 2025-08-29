// app/unauthorized/page.tsx
export default function UnauthorizedPage() {
    return (
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600">403 – Tidak Diizinkan</h1>
        <p className="mt-4 text-gray-600">Anda tidak memiliki izin untuk melihat halaman ini.</p>
      </div>
    )
  }
  