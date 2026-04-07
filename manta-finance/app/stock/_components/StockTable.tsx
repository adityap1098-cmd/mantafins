'use client'

import { useRef, useState } from 'react'
import type { StockRow } from '@/app/api/stock/route'
import { TruncatedCell } from '@/app/_components/TruncatedCell'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

interface StockTableProps {
  rows: StockRow[]
  loading: boolean
  sortKey: keyof StockRow | null
  sortDir: 'asc' | 'desc'
  onSort: (key: keyof StockRow) => void
  onStockEdit: (sku: string, newStock: number) => void
}

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

interface Column {
  key: keyof StockRow
  label: string
  align?: 'left' | 'right' | 'center'
}

const COLUMNS: Column[] = [
  { key: 'sku',          label: 'SKU' },
  { key: 'name',         label: 'Nama Produk' },
  { key: 'category',     label: 'Kategori' },
  { key: 'hpp',          label: 'HPP',        align: 'right' },
  { key: 'hargaJual',    label: 'Harga Jual', align: 'right' },
  { key: 'stock',        label: 'Stok',       align: 'right' },
  { key: 'marginUnit',   label: 'Margin/Unit', align: 'right' },
  { key: 'marginPersen', label: 'Margin %',   align: 'right' },
]

function SortIcon({ colKey, sortKey, sortDir }: { colKey: keyof StockRow; sortKey: keyof StockRow | null; sortDir: 'asc' | 'desc' }) {
  if (sortKey !== colKey) return <ChevronsUpDown size={12} className="inline ml-1 opacity-40" />
  return sortDir === 'asc'
    ? <ChevronUp size={12} className="inline ml-1" style={{ color: 'var(--accent)' }} />
    : <ChevronDown size={12} className="inline ml-1" style={{ color: 'var(--accent)' }} />
}

export function rowClass(row: StockRow): string {
  if (row.stock < 10) return 'row-warn'
  if (row.stock < 50) return 'row-warn'
  return ''
}

function catBadgeClass(category: string): string {
  let hash = 0
  for (let i = 0; i < category.length; i++) hash = ((hash << 5) - hash + category.charCodeAt(i)) | 0
  return `cat-badge cat-badge-${Math.abs(hash) % 8}`
}

export function MarginBadge({ persen }: { persen: number }) {
  const cls = persen >= 60 ? 'pct-good' : persen >= 40 ? 'pct-warn' : 'pct-bad'
  return (
    <span className={`num ${cls}`}>{persen.toFixed(1)}%</span>
  )
}

interface StockCellProps {
  row: StockRow
  onStockEdit: (sku: string, newStock: number) => void
}

function StockCell({ row, onStockEdit }: StockCellProps) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const commit = () => {
    if (!inputRef.current) return
    const val = inputRef.current.value.trim()
    const parsed = parseInt(val, 10)
    if (!isNaN(parsed) && parsed >= 0 && parsed !== row.stock) {
      onStockEdit(row.sku, parsed)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min="0"
        defaultValue={row.stock}
        autoFocus
        className="f-input"
        style={{ width: 80, height: 30, fontSize: 12 }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
      />
    )
  }

  return (
    <span
      className="font-mono cursor-pointer"
      style={{
        fontSize: 12,
        textDecoration: 'underline',
        textDecorationStyle: 'dotted',
        color: row.stock < 50 ? 'var(--red)' : 'inherit',
        fontWeight: row.stock < 50 ? 700 : 'normal',
      }}
      title="Klik untuk edit"
      onClick={() => setEditing(true)}
    >
      {row.stock}
    </span>
  )
}

const SKELETON_ROWS = [1, 2, 3, 4, 5]

export default function StockTable({ rows, loading, sortKey, sortDir, onSort, onStockEdit }: StockTableProps) {
  if (loading) {
    return (
      <div className="mr-card overflow-hidden" style={{ padding: 0 }}>
        <div className="mr-table-wrap">
          <table className="mr-table">
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th key={col.key} style={{ textAlign: col.align ?? 'left' }}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SKELETON_ROWS.map((i) => (
                <tr key={i} className="animate-pulse">
                  {COLUMNS.map((col) => (
                    <td key={col.key}>
                      <div className="h-4 bg-gray-100 rounded" style={{ width: '80%' }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="text-sm py-10 text-center" style={{ color: 'var(--text-3)' }}>
        Tidak ada data stock untuk periode ini.
      </div>
    )
  }

  return (
    <div className="mr-card overflow-hidden" style={{ padding: 0 }}>
      <div className="mr-table-wrap">
        <table className="mr-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => onSort(col.key)}
                  style={{ textAlign: col.align ?? 'left' }}
                >
                  {col.label}
                  <SortIcon colKey={col.key} sortKey={sortKey} sortDir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.sku} className={rowClass(row)}>
                <td>
                  <span className="num" style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {row.sku}
                  </span>
                </td>
                <td style={{ fontWeight: 500, color: 'var(--text-1)' }}>
                  <TruncatedCell text={row.name} maxWidth="max-w-[220px]" />
                </td>
                <td>
                  <span className={catBadgeClass(row.category)}>
                    {row.category}
                  </span>
                </td>
                <td className="text-right">
                  <span className="num" style={{ color: 'var(--text-2)' }}>{idr.format(row.hpp)}</span>
                </td>
                <td className="text-right">
                  <span className="num" style={{ color: 'var(--text-2)' }}>{idr.format(row.hargaJual)}</span>
                </td>
                <td className="text-right">
                  <StockCell row={row} onStockEdit={onStockEdit} />
                </td>
                <td className="text-right">
                  <span className="num" style={{ color: 'var(--text-2)' }}>{idr.format(row.marginUnit)}</span>
                </td>
                <td className="text-right">
                  <MarginBadge persen={row.marginPersen} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
