'use client'

import type { CustomerReceivable } from '@/app/api/receivables/route'
import type { PaymentTarget } from './ReceivablesClient'

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
  if (status === 'Terbayar' || status === 'LUNAS') {
    cls = 'bg-green-100 text-green-800'
  } else if (status === 'Belum Bayar' || status === 'BELUM BAYAR') {
    cls = 'bg-red-100 text-red-800'
  } else if (status === 'Sebagian') {
    cls = 'bg-yellow-100 text-yellow-800'
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

interface ReceivablesTableProps {
  receivables: CustomerReceivable[]
  loading: boolean
  expandedCustomer: string | null
  onToggleExpand: (customer: string) => void
  onRecordPayment: (target: PaymentTarget) => void
  onViewHistory: (customer: string) => void
}

export default function ReceivablesTable({
  receivables,
  loading,
  expandedCustomer,
  onToggleExpand,
  onRecordPayment,
  onViewHistory,
}: ReceivablesTableProps) {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100 animate-pulse">
                {Array.from({ length: 7 }).map((_item, j) => (
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

  if (receivables.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-8 text-center">
        Tidak ada data piutang untuk periode ini
      </div>
    )
  }

  // Sort by totalPiutang descending (already sorted by API, but ensure here too)
  const sorted = [...receivables].sort((a, b) => b.totalPiutang - a.totalPiutang)

  return (
    <div className="overflow-x-auto rounded border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white shadow-sm">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Konsumen
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Total Transaksi
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Total Tagihan
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Total Terbayar
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Outstanding
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Avg Diskon %
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((cr) => (
            <>
              <tr
                key={cr.customer}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-3 py-2 font-medium">{cr.customer}</td>
                <td className="px-3 py-2 text-center">{cr.totalTransaksi}</td>
                <td className="px-3 py-2">{formatCurrency(cr.totalTagihan)}</td>
                <td className="px-3 py-2">{formatCurrency(cr.totalTerbayar)}</td>
                <td className={`px-3 py-2 font-semibold ${cr.totalPiutang > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(cr.totalPiutang)}
                </td>
                <td className="px-3 py-2">{cr.avgDiskonPersen.toFixed(1)}%</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onToggleExpand(cr.customer)}
                      className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      {expandedCustomer === cr.customer ? 'Sembunyikan' : 'Lihat Detail'}
                    </button>
                    <button
                      onClick={() => onViewHistory(cr.customer)}
                      className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      Riwayat
                    </button>
                  </div>
                </td>
              </tr>
              {expandedCustomer === cr.customer && (
                <tr key={`${cr.customer}-detail`}>
                  <td colSpan={7} className="px-0 py-0">
                    <div className="bg-blue-50 border-l-4 border-blue-300 p-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-600">
                            <th className="px-2 py-1 text-left font-semibold">No Ref</th>
                            <th className="px-2 py-1 text-left font-semibold">Tanggal</th>
                            <th className="px-2 py-1 text-right font-semibold">Grand Total</th>
                            <th className="px-2 py-1 text-right font-semibold">Terbayar</th>
                            <th className="px-2 py-1 text-right font-semibold">Sisa</th>
                            <th className="px-2 py-1 text-left font-semibold">Status</th>
                            <th className="px-2 py-1 text-left font-semibold">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cr.sales.map((sale) => (
                            <tr key={sale.id} className="border-t border-blue-100">
                              <td className="px-2 py-1 font-mono">{sale.refNo}</td>
                              <td className="px-2 py-1">{formatDate(sale.date)}</td>
                              <td className="px-2 py-1 text-right">{formatCurrency(sale.grandTotal)}</td>
                              <td className="px-2 py-1 text-right">{formatCurrency(sale.paid)}</td>
                              <td className={`px-2 py-1 text-right font-semibold ${sale.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(sale.balance)}
                              </td>
                              <td className="px-2 py-1">
                                <StatusBadge status={sale.status} />
                              </td>
                              <td className="px-2 py-1">
                                {sale.balance > 0 && (
                                  <button
                                    onClick={() =>
                                      onRecordPayment({
                                        saleId: sale.id,
                                        balance: sale.balance,
                                        refNo: sale.refNo,
                                      })
                                    }
                                    className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                                  >
                                    Catat Bayar
                                  </button>
                                )}
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
