import type { PeriodSummary } from '@/lib/calculator/margin'

interface SummaryCardsProps {
  summary: PeriodSummary | null
  loading: boolean
}

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
})

function formatRupiah(value: number): string {
  return rupiahFormatter.format(value)
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

interface CardDef {
  label: string
  getValue: (s: PeriodSummary) => string
  valueClass?: string
}

const CARDS: CardDef[] = [
  {
    label: 'Total Penjualan',
    getValue: (s) => formatRupiah(s.totalPenjualan),
  },
  {
    label: 'Total HPP',
    getValue: (s) => formatRupiah(s.totalHpp),
  },
  {
    label: 'Laba Kotor',
    getValue: (s) => formatRupiah(s.totalLabaKotor),
    valueClass: 'text-green-700',
  },
  {
    label: 'Total Diskon',
    getValue: (s) => formatRupiah(s.totalDiskon),
  },
  {
    label: 'Piutang Aktif',
    getValue: (s) => formatRupiah(s.totalPiutang),
    valueClass: 'text-amber-600',
  },
  {
    label: 'Sudah Terbayar',
    getValue: (s) => formatRupiah(s.totalTerbayar),
  },
  {
    label: 'Margin %',
    getValue: (s) => formatPercent(s.marginPersen),
    valueClass: 'text-blue-700',
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

export default function SummaryCards({ summary, loading }: SummaryCardsProps) {
  const data = summary ?? ZERO_SUMMARY

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {CARDS.map((card, index) => (
        <div
          key={card.label}
          className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm ${
            index === 6 ? 'col-span-2 md:col-span-1' : ''
          }`}
        >
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {card.label}
          </p>
          {loading ? (
            <div className="animate-pulse bg-gray-200 rounded h-8 mt-1" />
          ) : (
            <p
              className={`text-xl font-bold mt-1 ${
                card.valueClass ?? 'text-gray-900'
              }`}
            >
              {card.getValue(data)}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
