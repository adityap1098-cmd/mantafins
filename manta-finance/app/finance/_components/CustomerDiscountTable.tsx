'use client'

import { useState } from 'react'

interface CustomerDiscountRow {
  customer: string
  totalTransaksi: number
  totalPenjualan: number
  totalDiskon: number
  avgDiskonPersen: number
}

interface CustomerDiscountTableProps {
  rows: CustomerDiscountRow[]
}

type SortKey = keyof CustomerDiscountRow

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
})

function discountColor(pct: number): string {
  if (pct <= 5) return 'text-[var(--green)] font-semibold'
  if (pct <= 15) return 'text-[var(--orange)] font-semibold'
  return 'text-[var(--red)] font-semibold'
}

interface ThProps {
  label: string
  sortKey: SortKey
  currentSortKey: SortKey
  sortDir: 'asc' | 'desc'
  onSort: (key: SortKey) => void
  align?: 'left' | 'right'
}

function SortableTh({ label, sortKey, currentSortKey, sortDir, onSort, align = 'left' }: ThProps) {
  const isActive = currentSortKey === sortKey
  return (
    <th
      className={align === 'right' ? 'text-right' : 'text-left'}
      onClick={() => onSort(sortKey)}
    >
      <span
        className="flex items-center gap-1"
        style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}
      >
        {label}
        <span className="opacity-60 text-[10px]">{isActive ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
      </span>
    </th>
  )
}

export default function CustomerDiscountTable({ rows }: CustomerDiscountTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('totalDiskon')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="mr-card overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold text-[var(--text-1)]">Diskon per Konsumen</h2>
      </div>

      {sorted.length === 0 ? (
        <p className="px-5 py-8 text-sm text-[var(--text-3)] text-center">
          Tidak ada data konsumen untuk periode ini
        </p>
      ) : (
        <div className="mr-table-wrap">
          <table className="mr-table">
            <thead>
              <tr>
                <SortableTh label="Konsumen" sortKey="customer" currentSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Total Transaksi" sortKey="totalTransaksi" currentSortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                <SortableTh label="Total Penjualan" sortKey="totalPenjualan" currentSortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                <SortableTh label="Total Diskon" sortKey="totalDiskon" currentSortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                <SortableTh label="Avg Diskon %" sortKey="avgDiskonPersen" currentSortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.customer}>
                  <td className="font-medium text-[var(--text-1)]">{row.customer}</td>
                  <td className="text-right font-mono text-[var(--text-2)]">{row.totalTransaksi.toLocaleString('id-ID')}</td>
                  <td className="text-right font-mono text-[var(--text-2)]">{idr.format(row.totalPenjualan)}</td>
                  <td className="text-right font-mono text-[var(--text-2)]">{idr.format(row.totalDiskon)}</td>
                  <td className={`text-right font-mono ${discountColor(row.avgDiskonPersen)}`}>
                    {row.avgDiskonPersen.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
