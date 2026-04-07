import type { PeriodSummary } from '@/lib/calculator/margin'
import { computeTrend } from '@/lib/dashboard/trend'
import {
  TrendingUp,
  Calculator,
  DollarSign,
  Tag,
  CreditCard,
  CheckCircle,
  BarChart2,
} from 'lucide-react'

interface SummaryCardsProps {
  summary: PeriodSummary | null
  previousSummary: PeriodSummary | null
  loading: boolean
}

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
})

function formatRupiah(value: number): string {
  return idr.format(value)
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

interface CardDef {
  label: string
  getValue: (s: PeriodSummary) => string
  getNumericValue: (s: PeriodSummary) => number
  getSubText?: (s: PeriodSummary) => string | null
  color: 'accent' | 'green' | 'red' | 'orange' | 'blue'
  icon: React.ElementType
  positiveDirection: 'up' | 'down'
  showTrend: boolean
  valueStyle?: React.CSSProperties
}

const CARDS: CardDef[] = [
  {
    label: 'Total Penjualan',
    getValue: (s) => formatRupiah(s.totalPenjualan),
    getNumericValue: (s) => s.totalPenjualan,
    color: 'accent',
    icon: TrendingUp,
    positiveDirection: 'up',
    showTrend: true,
  },
  {
    label: 'Total HPP',
    getValue: (s) => formatRupiah(s.totalHpp),
    getNumericValue: (s) => s.totalHpp,
    getSubText: (s) => s.totalPenjualan > 0
      ? `${((s.totalHpp / s.totalPenjualan) * 100).toFixed(1)}% dari penjualan`
      : null,
    color: 'blue',
    icon: Calculator,
    positiveDirection: 'down',
    showTrend: false,
  },
  {
    label: 'Laba Kotor',
    getValue: (s) => formatRupiah(s.totalLabaKotor),
    getNumericValue: (s) => s.totalLabaKotor,
    getSubText: (s) => `${s.marginPersen.toFixed(2)}% margin`,
    color: 'green',
    icon: DollarSign,
    positiveDirection: 'up',
    showTrend: false,
    valueStyle: { color: 'var(--green)' },
  },
  {
    label: 'Total Diskon',
    getValue: (s) => formatRupiah(s.totalDiskon),
    getNumericValue: (s) => s.totalDiskon,
    getSubText: (s) => s.totalPenjualan > 0
      ? `${((s.totalDiskon / s.totalPenjualan) * 100).toFixed(1)}% dari penjualan`
      : null,
    color: 'orange',
    icon: Tag,
    positiveDirection: 'down',
    showTrend: false,
  },
]

const ZERO_SUMMARY: PeriodSummary = {
  totalPenjualan: 0,
  totalHpp: 0,
  totalLabaKotor: 0,
  totalDiskon: 0,
  totalPiutang: 0,
  totalTerbayar: 0,
  marginPersen: 0,
}

const COLOR_MAP = {
  accent: {
    bg: 'var(--accent-bg)',
    icon: 'var(--accent)',
  },
  green: {
    bg: 'var(--green-bg)',
    icon: 'var(--green)',
  },
  red: {
    bg: 'var(--red-bg)',
    icon: 'var(--red)',
  },
  orange: {
    bg: 'var(--orange-bg)',
    icon: 'var(--orange)',
  },
  blue: {
    bg: 'var(--blue-bg)',
    icon: 'var(--blue)',
  },
}

export default function SummaryCards({ summary, previousSummary, loading }: SummaryCardsProps) {
  const data = summary ?? ZERO_SUMMARY

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
      {CARDS.map((card) => {
        const numericCurrent = card.getNumericValue(data)
        const numericPrev = previousSummary ? card.getNumericValue(previousSummary) : null
        const trend = computeTrend(numericCurrent, numericPrev)
        const colors = COLOR_MAP[card.color]
        const Icon = card.icon

        return (
          <div key={card.label} className={`kpi-card ${card.color}`}>
            {/* Top: label + icon */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="uppercase font-semibold"
                style={{ fontSize: 11, letterSpacing: '0.6px', color: 'var(--text-3)' }}
              >
                {card.label}
              </span>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: colors.bg,
                  color: colors.icon,
                }}
              >
                <Icon size={17} />
              </div>
            </div>

            {/* Value */}
            {loading ? (
              <div className="animate-pulse bg-gray-200 rounded h-7 mt-1 mb-2" />
            ) : (
              <p
                className="num-lg mb-1"
                style={{ ...(card.valueStyle ?? {}) }}
              >
                {card.getValue(data)}
              </p>
            )}

            {/* Sub info */}
            {!loading && card.showTrend && trend !== null && (
              <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: 'var(--text-2)' }}>
                <span
                  className="font-semibold"
                  style={{
                    fontSize: 10,
                    padding: '2px 7px',
                    borderRadius: 6,
                    background: trend.direction === card.positiveDirection ? 'var(--green-bg)' : 'var(--red-bg)',
                    color: trend.direction === card.positiveDirection ? 'var(--green-t)' : 'var(--red-t)',
                  }}
                >
                  {trend.direction === 'up' ? '+' : '−'}{Math.abs(trend.pct).toFixed(1)}%
                </span>
                vs bulan lalu
              </div>
            )}
            {!loading && !card.showTrend && card.getSubText && (
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
                {card.getSubText(data)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
