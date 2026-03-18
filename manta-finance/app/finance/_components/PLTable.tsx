'use client'

interface FinanceSummary {
  totalPendapatan: number
  totalHpp: number
  labaKotor: number
  totalDiskon: number
  totalBiayaOperasional: number
  labaBersih: number
  marginKotor: number
  marginBersih: number
  totalPiutang: number
  totalTerbayar: number
  operationalCosts: { id: string; description: string; amount: number }[]
}

interface PLTableProps {
  summary: FinanceSummary
}

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
})

function formatIdr(value: number) {
  return idr.format(value)
}

function formatPct(value: number) {
  return `${value.toFixed(1)}%`
}

interface RowProps {
  label: string
  value: string
  bold?: boolean
  highlight?: boolean
  separator?: boolean
  valueColor?: 'green' | 'red' | 'default'
  indent?: boolean
}

function PLRow({ label, value, bold, highlight, separator, valueColor = 'default', indent }: RowProps) {
  const rowClass = [
    'flex justify-between py-2 px-3',
    separator ? 'border-t-2 border-gray-300 mt-1' : 'border-t border-gray-100',
    highlight ? 'bg-green-50' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const labelClass = [
    'text-sm',
    bold ? 'font-semibold text-gray-800' : 'text-gray-600',
    indent ? 'pl-4' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const valueClass = [
    'text-sm',
    bold ? 'font-semibold' : '',
    valueColor === 'green' ? 'text-green-600' : valueColor === 'red' ? 'text-red-600' : 'text-gray-800',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rowClass}>
      <span className={labelClass}>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  )
}

export default function PLTable({ summary }: PLTableProps) {
  const isLabaBersihPositive = summary.labaBersih >= 0
  const isLabaKotorPositive = summary.labaKotor >= 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-800">Laporan Laba Rugi</h2>
      </div>
      <div className="divide-y-0">
        <PLRow
          label="Pendapatan Kotor"
          value={formatIdr(summary.totalPendapatan)}
          valueColor="green"
        />
        <PLRow
          label="Harga Pokok Penjualan (HPP)"
          value={`(${formatIdr(summary.totalHpp)})`}
          valueColor="red"
          indent
        />
        <PLRow
          label="Laba Kotor"
          value={formatIdr(summary.labaKotor)}
          bold
          separator
          valueColor={isLabaKotorPositive ? 'green' : 'red'}
        />
        <PLRow
          label="Margin Kotor"
          value={formatPct(summary.marginKotor)}
          indent
        />
        <PLRow
          label="Total Diskon"
          value={`(${formatIdr(summary.totalDiskon)})`}
          valueColor="red"
          indent
        />
        <PLRow
          label="Biaya Operasional"
          value={`(${formatIdr(summary.totalBiayaOperasional)})`}
          valueColor="red"
          indent
        />
        <PLRow
          label="Laba Bersih"
          value={formatIdr(summary.labaBersih)}
          bold
          separator
          highlight={isLabaBersihPositive}
          valueColor={isLabaBersihPositive ? 'green' : 'red'}
        />
        <PLRow
          label="Margin Bersih"
          value={formatPct(summary.marginBersih)}
          indent
        />
        <PLRow
          label="Total Piutang"
          value={formatIdr(summary.totalPiutang)}
          separator
        />
        <PLRow
          label="Sudah Terbayar"
          value={formatIdr(summary.totalTerbayar)}
          valueColor="green"
          indent
        />
      </div>
    </div>
  )
}
