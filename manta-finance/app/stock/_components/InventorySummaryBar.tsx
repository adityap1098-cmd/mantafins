'use client'

import type { InventorySummary } from '@/app/api/stock/route'

interface InventorySummaryBarProps {
  summary: InventorySummary | null
  loading: boolean
}

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export default function InventorySummaryBar({
  summary,
  loading,
}: InventorySummaryBarProps) {
  if (loading) {
    return (
      <div className="flex gap-4 mb-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-6 bg-gray-300 rounded w-24" />
          </div>
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-sm text-gray-400 mb-4 py-3">
        Pilih periode untuk melihat ringkasan
      </div>
    )
  }

  const stats = [
    { label: 'Total Nilai HPP', value: idr.format(summary.totalHppValue) },
    {
      label: 'Total Nilai Harga Jual',
      value: idr.format(summary.totalHargaJualValue),
    },
    { label: 'Potensi Profit', value: idr.format(summary.potentialProfit) },
  ]

  return (
    <div className="flex gap-4 mb-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex-1 bg-white border border-gray-200 rounded-lg p-4"
        >
          <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
          <p className="text-lg font-semibold text-gray-800">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
