'use client'

import { useState } from 'react'
import type { SaleRow } from '@/app/api/sales/route'

const idFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function formatCurrency(n: number) {
  return idFormatter.format(n)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }: { status: string }) {
  let cls = 'bg-yellow-100 text-yellow-800'
  if (status === 'LUNAS') cls = 'bg-green-100 text-green-800'
  else if (status === 'BELUM BAYAR') cls = 'bg-red-100 text-red-800'

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

type SortKey = 'date' | 'grandTotal' | 'marginPersen'

interface SalesTableProps {
  rows: SaleRow[]
  loading: boolean
  sortKey: SortKey | null
  sortDir: 'asc' | 'desc'
  onSort: (key: SortKey) => void
}

function SortArrow({
  col,
  sortKey,
  sortDir,
}: {
  col: SortKey
  sortKey: SortKey | null
  sortDir: 'asc' | 'desc'
}) {
  if (sortKey !== col) return <span className="ml-1 text-gray-400">&#8597;</span>
  return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
}

function SortableHeader({
  col,
  label,
  sortKey,
  sortDir,
  onSort,
}: {
  col: SortKey
  label: string
  sortKey: SortKey | null
  sortDir: 'asc' | 'desc'
  onSort: (key: SortKey) => void
}) {
  return (
    <th
      onClick={() => onSort(col)}
      className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer select-none hover:bg-gray-100"
    >
      {label}
      <SortArrow col={col} sortKey={sortKey} sortDir={sortDir} />
    </th>
  )
}

export default function SalesTable({
  rows,
  loading,
  sortKey,
  sortDir,
  onSort,
}: SalesTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100 animate-pulse">
                {Array.from({ length: 10 }).map((__, j) => (
                  <td key={j} className="px-3 py-3">
                    <div className="h-3 bg-gray-200 rounded" />
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
      <div className="text-sm text-gray-500 py-8 text-center">
        Tidak ada transaksi untuk periode ini.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white shadow-sm">
          <tr>
            <SortableHeader
              col="date"
              label="Tanggal"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              No Ref
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Konsumen
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Jml Item
            </th>
            <SortableHeader
              col="grandTotal"
              label="Grand Total"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              HPP Total
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Laba Kotor
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Diskon
            </th>
            <SortableHeader
              col="marginPersen"
              label="Margin %"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <>
              <tr
                key={row.id}
                onClick={() =>
                  setExpandedId(expandedId === row.id ? null : row.id)
                }
                className="border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <td className="px-3 py-2">{formatDate(row.date)}</td>
                <td className="px-3 py-2 font-mono text-xs">{row.refNo}</td>
                <td className="px-3 py-2">{row.customer}</td>
                <td className="px-3 py-2 text-center">{row.itemCount}</td>
                <td className="px-3 py-2">{formatCurrency(row.grandTotal)}</td>
                <td className="px-3 py-2">{formatCurrency(row.totalHpp)}</td>
                <td className="px-3 py-2">{formatCurrency(row.labaKotor)}</td>
                <td className="px-3 py-2">{formatCurrency(row.diskon)}</td>
                <td className="px-3 py-2">{row.marginPersen.toFixed(1)}%</td>
                <td className="px-3 py-2">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
              {expandedId === row.id && (
                <tr key={`${row.id}-detail`}>
                  <td colSpan={10} className="px-0 py-0">
                    <div className="bg-blue-50 border-l-4 border-blue-300 p-3 text-xs">
                      <table className="w-full">
                        <thead>
                          <tr className="text-gray-600">
                            <th className="px-2 py-1 text-left font-semibold">
                              Produk
                            </th>
                            <th className="px-2 py-1 text-left font-semibold">
                              SKU
                            </th>
                            <th className="px-2 py-1 text-right font-semibold">
                              Qty
                            </th>
                            <th className="px-2 py-1 text-right font-semibold">
                              HPP/Unit
                            </th>
                            <th className="px-2 py-1 text-right font-semibold">
                              Harga/Unit
                            </th>
                            <th className="px-2 py-1 text-right font-semibold">
                              Total HPP
                            </th>
                            <th className="px-2 py-1 text-right font-semibold">
                              Total Harga
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {row.items.map((item) => (
                            <tr
                              key={item.sku}
                              className="border-t border-blue-100"
                            >
                              <td className="px-2 py-1">{item.productName}</td>
                              <td className="px-2 py-1 font-mono">
                                {item.sku}
                              </td>
                              <td className="px-2 py-1 text-right">
                                {item.qty}
                              </td>
                              <td className="px-2 py-1 text-right">
                                {formatCurrency(item.hppUnit)}
                              </td>
                              <td className="px-2 py-1 text-right">
                                {formatCurrency(item.hargaUnit)}
                              </td>
                              <td className="px-2 py-1 text-right">
                                {formatCurrency(item.totalHpp)}
                              </td>
                              <td className="px-2 py-1 text-right">
                                {formatCurrency(item.totalHarga)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
