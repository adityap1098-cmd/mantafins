'use client'

// Stub component — full implementation in Plan 04-04 (Sales UI)
// Created as Rule 3 auto-fix to unblock build while SalesClient is already committed

import type { SaleRow } from '@/app/api/sales/route'

type SortKey = 'date' | 'grandTotal' | 'marginPersen'

interface SalesTableProps {
  rows: SaleRow[]
  loading: boolean
  sortKey: SortKey | null
  sortDir: 'asc' | 'desc'
  onSort: (key: SortKey) => void
}

export default function SalesTable({ rows, loading }: SalesTableProps) {
  if (loading) {
    return (
      <div className="text-sm text-gray-400 py-4 text-center animate-pulse">
        Memuat data penjualan...
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="text-sm text-gray-400 py-8 text-center">
        Tidak ada data penjualan untuk periode ini.
      </div>
    )
  }

  return (
    <div className="overflow-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white shadow-sm">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref No</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Konsumen</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-2">{new Date(row.date).toLocaleDateString('id-ID')}</td>
              <td className="px-4 py-2 font-mono text-xs">{row.refNo}</td>
              <td className="px-4 py-2">{row.customer}</td>
              <td className="px-4 py-2">{row.status}</td>
              <td className="px-4 py-2 text-right tabular-nums">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(row.grandTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
