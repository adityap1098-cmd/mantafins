'use client'

import { useRef, useState } from 'react'
import type { StockRow } from '@/app/api/stock/route'

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
}

const COLUMNS: Column[] = [
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Nama Produk' },
  { key: 'category', label: 'Kategori' },
  { key: 'hpp', label: 'HPP' },
  { key: 'hargaJual', label: 'Harga Jual' },
  { key: 'stock', label: 'Stok' },
  { key: 'marginUnit', label: 'Margin/Unit' },
  { key: 'marginPersen', label: 'Margin %' },
]

function SortArrow({
  colKey,
  sortKey,
  sortDir,
}: {
  colKey: keyof StockRow
  sortKey: keyof StockRow | null
  sortDir: 'asc' | 'desc'
}) {
  if (sortKey !== colKey) return <span className="ml-1 text-gray-300">↕</span>
  return (
    <span className="ml-1 text-blue-500">
      {sortDir === 'asc' ? '↑' : '↓'}
    </span>
  )
}

function rowClass(stock: number): string {
  if (stock < 10) return 'bg-red-50 hover:bg-red-100'
  if (stock < 50) return 'bg-yellow-50 hover:bg-yellow-100'
  return 'hover:bg-gray-50'
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
        className="w-20 border rounded px-1 text-sm border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
      className="cursor-pointer underline decoration-dotted decoration-gray-400"
      title="Klik untuk edit"
      onClick={() => setEditing(true)}
    >
      {row.stock}
    </span>
  )
}

export default function StockTable({
  rows,
  loading,
  sortKey,
  sortDir,
  onSort,
  onStockEdit,
}: StockTableProps) {
  if (loading) {
    return (
      <div className="overflow-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white shadow-sm">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="animate-pulse border-t border-gray-100">
                {COLUMNS.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="text-sm text-gray-400 py-8 text-center">
        Tidak ada data stock untuk periode ini.
      </div>
    )
  }

  return (
    <div className="overflow-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white shadow-sm">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => onSort(col.key)}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:bg-gray-50"
              >
                {col.label}
                <SortArrow colKey={col.key} sortKey={sortKey} sortDir={sortDir} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.sku}
              className={`border-t border-gray-100 transition-colors ${rowClass(row.stock)}`}
            >
              <td className="px-4 py-2 font-mono text-xs text-gray-600">{row.sku}</td>
              <td className="px-4 py-2 text-gray-800">{row.name}</td>
              <td className="px-4 py-2 text-gray-600">{row.category}</td>
              <td className="px-4 py-2 text-gray-700 tabular-nums">
                {idr.format(row.hpp)}
              </td>
              <td className="px-4 py-2 text-gray-700 tabular-nums">
                {idr.format(row.hargaJual)}
              </td>
              <td className="px-4 py-2">
                <StockCell row={row} onStockEdit={onStockEdit} />
              </td>
              <td className="px-4 py-2 text-gray-700 tabular-nums">
                {idr.format(row.marginUnit)}
              </td>
              <td className="px-4 py-2 text-gray-700 tabular-nums">
                {row.marginPersen.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
