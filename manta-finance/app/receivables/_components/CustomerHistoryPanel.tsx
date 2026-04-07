'use client'

import { useState, useEffect } from 'react'
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

interface CustomerHistoryPanelProps {
  customer: string | null
  periodId: string
  onClose: () => void
}

export default function CustomerHistoryPanel({
  customer,
  periodId,
  onClose,
}: CustomerHistoryPanelProps) {
  const [sales, setSales] = useState<SaleRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!customer || !periodId) return

    setLoading(true)
    setError('')
    setSales([])

    fetch(
      `/api/receivables/customer?customer=${encodeURIComponent(customer)}&periodId=${encodeURIComponent(periodId)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat riwayat')
        return res.json() as Promise<{ sales: SaleRow[] }>
      })
      .then((data) => {
        setSales(data.sales)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat riwayat')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [customer, periodId])

  if (!customer) return null

  const totalGrandTotal = sales.reduce((sum, s) => sum + s.grandTotal, 0)
  const totalLabaKotor = sales.reduce((sum, s) => sum + s.labaKotor, 0)
  const avgMargin =
    sales.length > 0
      ? sales.reduce((sum, s) => sum + s.marginPersen, 0) / sales.length
      : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel card */}
      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800">
            Riwayat Pembelian &mdash; {customer}
          </h2>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading && (
            <div className="text-sm text-gray-500 py-8 text-center">Memuat data...</div>
          )}

          {error && (
            <div className="text-sm text-red-500 py-4 text-center">{error}</div>
          )}

          {!loading && !error && sales.length === 0 && (
            <div className="text-sm text-gray-500 py-8 text-center">
              Tidak ada transaksi untuk konsumen ini
            </div>
          )}

          {!loading && !error && sales.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Tanggal
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    No Ref
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Grand Total
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    HPP Total
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Laba Kotor
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Margin %
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2">{formatDate(sale.date)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{sale.refNo}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(sale.grandTotal)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(sale.totalHpp)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(sale.labaKotor)}</td>
                    <td className="px-3 py-2 text-right">{sale.marginPersen.toFixed(1)}%</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Summary row */}
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                  <td className="px-3 py-2 text-xs text-gray-600" colSpan={2}>
                    Total ({sales.length} transaksi)
                  </td>
                  <td className="px-3 py-2 text-right text-xs">{formatCurrency(totalGrandTotal)}</td>
                  <td className="px-3 py-2 text-right text-xs"></td>
                  <td className="px-3 py-2 text-right text-xs">{formatCurrency(totalLabaKotor)}</td>
                  <td className="px-3 py-2 text-right text-xs">{avgMargin.toFixed(1)}%</td>
                  <td className="px-3 py-2"></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
