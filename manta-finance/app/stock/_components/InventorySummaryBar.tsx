'use client'

import type { InventorySummary } from '@/app/api/stock/route'
import { Package, DollarSign, TrendingUp } from 'lucide-react'

interface InventorySummaryBarProps {
  summary: InventorySummary | null
  loading: boolean
}

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const STATS = [
  {
    key: 'totalHppValue' as const,
    label: 'Total Nilai HPP',
    color: 'blue' as const,
    icon: Package,
    sub: 'Nilai modal stok',
  },
  {
    key: 'totalHargaJualValue' as const,
    label: 'Total Harga Jual',
    color: 'accent' as const,
    icon: DollarSign,
    sub: 'Potensi revenue',
  },
  {
    key: 'potentialProfit' as const,
    label: 'Potensi Profit',
    color: 'green' as const,
    icon: TrendingUp,
    sub: null,
    valueStyle: { color: 'var(--green)' },
  },
]

const COLOR_MAP = {
  accent: { bg: 'var(--accent-bg)', icon: 'var(--accent)' },
  green:  { bg: 'var(--green-bg)',  icon: 'var(--green)' },
  blue:   { bg: 'var(--blue-bg)',   icon: 'var(--blue)' },
}

export default function InventorySummaryBar({
  summary,
  loading,
}: InventorySummaryBarProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4 mb-5 resp-kpi-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="kpi-card animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-6 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-sm mb-5 py-3" style={{ color: 'var(--text-3)' }}>
        Pilih periode untuk melihat ringkasan
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-4 mb-5 resp-kpi-3">
      {STATS.map(({ key, label, color, icon: Icon, sub, valueStyle }) => {
        const colors = COLOR_MAP[color]
        return (
          <div key={key} className={`kpi-card ${color}`}>
            <div className="flex items-center justify-between mb-3">
              <span
                className="uppercase font-semibold"
                style={{ fontSize: 11, letterSpacing: '0.6px', color: 'var(--text-3)' }}
              >
                {label}
              </span>
              <div
                className="flex items-center justify-center"
                style={{ width: 34, height: 34, borderRadius: 9, background: colors.bg, color: colors.icon }}
              >
                <Icon size={17} />
              </div>
            </div>
            <p
              className="num-lg"
              style={{ ...(valueStyle ?? {}) }}
            >
              {idr.format(summary[key])}
            </p>
            {sub && (
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{sub}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
