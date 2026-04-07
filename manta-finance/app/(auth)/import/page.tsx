import type { Metadata } from 'next'
import ImportPageClient from '@/app/import/_components/ImportPageClient'

export const metadata: Metadata = {
  title: 'Import Data | Manta Racing Finance',
}

export default function ImportPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Import Data</h1>
      <p className="text-sm text-gray-500 mb-6">Upload produk dan data penjualan</p>
      <ImportPageClient />
    </div>
  )
}
