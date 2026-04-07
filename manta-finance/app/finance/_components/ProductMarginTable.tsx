'use client'

import { useState } from 'react'
import { TruncatedCell } from '@/app/_components/TruncatedCell'

interface ProductMarginRow {
  productName: string
  sku: string
  totalQty: number
  hppUnit: number
  avgHargaAktual: number
  totalLabaKotor: number
  marginPersen: number
}

interface ProductMarginTableProps {
  rows: ProductMarginRow[]
}

type SortKey = keyof ProductMarginRow

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
})

function marginClass(pct: number): string {
  if (pct >= 60) return 'pct-good'
  if (pct >= 40) return 'pct-warn'
  return 'pct-bad'
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
      <span className="flex items-center gap-1" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        {label}
        <span className="opacity-60 text-[10px]">{isActive ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
      </span>
    </th>
  )
}

export default function ProductMarginTable({ rows }: ProductMarginTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('marginPersen')
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
        <h2 className="text-sm font-semibold text-[var(--text-1)]">Margin per Produk</h2>
      </div>

      {sorted.length === 0 ? (
        <p className="px-5 py-8 text-sm text-[var(--text-3)] text-center">
          Tidak ada data produk untuk periode ini
        </p>
      ) : (
        <div className="mr-table-wrap">
          <table className="mr-table">
            <thead>
              <tr>
                <SortableTh label="Nama Produk" sortKey="productName" currentSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="SKU" sortKey="sku" currentSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Total Qty" sortKey="totalQty" currentSortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                <SortableTh label="HPP/Unit" sortKey="hppUnit" currentSortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                <SortableTh label="Avg Harga Aktual" sortKey="avgHargaAktual" currentSortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                <SortableTh label="Laba Kotor" sortKey="totalLabaKotor" currentSortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
                <SortableTh label="Margin %" sortKey="marginPersen" currentSortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="right" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.sku}>
                  <td className="font-medium text-[var(--text-1)]">
                    <TruncatedCell text={row.productName} maxWidth="max-w-[220px]" />
                  </td>
                  <td><span className="num" style={{ fontSize: 11, color: 'var(--text-3)' }}>{row.sku}</span></td>
                  <td className="text-right"><span className="num" style={{ color: 'var(--text-2)' }}>{row.totalQty.toLocaleString('id-ID')}</span></td>
                  <td className="text-right"><span className="num" style={{ color: 'var(--text-2)' }}>{idr.format(row.hppUnit)}</span></td>
                  <td className="text-right"><span className="num" style={{ color: 'var(--text-2)' }}>{idr.format(row.avgHargaAktual)}</span></td>
                  <td className="text-right"><span className="num" style={{ color: 'var(--text-2)' }}>{idr.format(row.totalLabaKotor)}</span></td>
                  <td className="text-right">
                    <div className="margin-bar-wrap">
                      <div
                        className="margin-bar"
                        style={{ width: `${Math.min(Math.max(row.marginPersen, 0), 100)}%` }}
                      >
                        <div className={`margin-bar-fill ${marginClass(row.marginPersen)}`} />
                      </div>
                      <span className={`num ${marginClass(row.marginPersen)}`}>{row.marginPersen.toFixed(1)}%</span>
                    </div>
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
