import type { Metadata } from 'next'
import ExportClient from '@/app/export/_components/ExportClient'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Export Data | Manta Racing Finance',
}

export default async function ExportPage() {
  const periods = await prisma.period.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Export Data</h1>
      <p className="text-sm text-gray-500 mb-6">Unduh laporan Excel</p>
      <ExportClient periods={periods} />
    </div>
  )
}
