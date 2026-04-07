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
  const s = status.toLowerCase().trim()
  if (s === 'lunas' || s === 'terbayar' || s === 'paid' || s === 'sudah bayar' || s === 'dibayar') {
    return <span className="badge badge-green">Terbayar</span>
  }
  if (s === 'belum bayar' || s === 'belum dibayar' || s === 'unpaid' || s === 'overdue' || s === 'belum lunas') {
    return <span className="badge badge-red">Belum Bayar</span>
  }
  return <span className="badge badge-orange">Tertunda</span>
}

interface ReceivablesTableProps {
  receivables: CustomerReceivable[]
  loading: boolean
  expandedCustomer: string | null
  onToggleExpand: (customer: string) => void
  onRecordPayment: (target: PaymentTarget) => void
  onQuickPay: (target: PaymentTarget) => void
  onViewHistory: (customer: string) => void
}

export default function ReceivablesTable({
  receivables,
  loading,
  expandedCustomer,
  onToggleExpand,
  onRecordPayment,
  onQuickPay,
  onViewHistory,
}: ReceivablesTableProps) {
  if (loading) {
    return (
      <div className="mr-table-wrap mr-card overflow-hidden">
        <table className="mr-table">
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {Array.from({ length: 7 }).map((_item, j) => (
                  <td key={j}>
                    <div className="h-3 bg-[var(--border)] rounded" />
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
      <div className="mr-card px-5 py-10 text-sm text-[var(--text-3)] text-center">
        Tidak ada data piutang untuk periode ini
      </div>
    )
  }

  // Sort by totalPiutang descending (already sorted by API, but ensure here too)
  const sorted = [...receivables].sort((a, b) => b.totalPiutang - a.totalPiutang)

  return (
    <div className="mr-table-wrap mr-card overflow-hidden">
      <table className="mr-table">
        <thead>
          <tr>
            <th>Konsumen</th>
            <th className="text-center">Transaksi</th>
            <th className="text-right">Total Tagihan</th>
            <th className="text-right">Terbayar</th>
            <th className="text-right">Outstanding</th>
            <th className="text-center">Avg Diskon</th>
            <th className="text-center">Progress</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((cr) => {
            const isPaid = cr.totalPiutang <= 0
            const progressPct = cr.totalTagihan > 0 ? Math.round((cr.totalTerbayar / cr.totalTagihan) * 100) : 0
            const progressColor = isPaid || progressPct >= 80
              ? 'var(--green)'
              : progressPct >= 50
                ? 'var(--accent)'
                : progressPct >= 20
                  ? 'var(--orange)'
                  : 'var(--red)'
            return (
            <>
              <tr key={cr.customer} style={isPaid ? { opacity: 0.6 } : undefined}>
                <td style={{ fontWeight: 600 }}>{cr.customer}</td>
                <td className="text-center"><span className="num" style={{ color: 'var(--text-2)' }}>{cr.totalTransaksi}</span></td>
                <td className="text-right"><span className="num" style={{ color: 'var(--text-2)' }}>{formatCurrency(cr.totalTagihan)}</span></td>
                <td className="text-right"><span className="num" style={{ color: isPaid ? 'var(--green)' : 'var(--text-2)' }}>{formatCurrency(cr.totalTerbayar)}</span></td>
                <td className="text-right"><span className="num font-semibold" style={{ color: isPaid ? 'var(--green)' : 'var(--red)' }}>
                  {isPaid ? formatCurrency(0) : formatCurrency(cr.totalPiutang)}
                </span></td>
                <td className="text-center"><span className="num" style={{ color: 'var(--text-2)' }}>{cr.avgDiskonPersen.toFixed(1)}%</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="prog-bar">
                      <div className="prog-fill" style={{ width: `${progressPct}%`, background: progressColor }} />
                    </div>
                    <span className="num" style={{ fontSize: 11, color: isPaid ? 'var(--green)' : 'var(--text-3)' }}>{progressPct}%</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <a
                      onClick={() => onToggleExpand(cr.customer)}
                      style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                    >
                      Detail
                    </a>
                    <a
                      onClick={() => onViewHistory(cr.customer)}
                      style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                    >
                      Riwayat
                    </a>
                    {!isPaid && cr.sales.some((s) => s.balance > 0) && (
                      <button
                        onClick={() => {
                          const firstUnpaid = cr.sales.find((s) => s.balance > 0)
                          if (firstUnpaid) {
                            onQuickPay({ saleId: firstUnpaid.id, balance: firstUnpaid.balance, refNo: firstUnpaid.refNo })
                          }
                        }}
                        className="btn btn-sm btn-green"
                      >
                        Bayar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              {expandedCustomer === cr.customer && (
                <tr key={`${cr.customer}-detail`}>
                  <td colSpan={8} className="!p-0">
                    <div className="bg-[var(--accent-bg)] border-l-4 border-[var(--accent)] px-4 py-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-[var(--text-3)]">
                            <th className="px-2 py-1 text-left font-semibold uppercase tracking-wide">No Ref</th>
                            <th className="px-2 py-1 text-left font-semibold uppercase tracking-wide">Tanggal</th>
                            <th className="px-2 py-1 text-right font-semibold uppercase tracking-wide">Grand Total</th>
                            <th className="px-2 py-1 text-right font-semibold uppercase tracking-wide">Terbayar</th>
                            <th className="px-2 py-1 text-right font-semibold uppercase tracking-wide">Sisa</th>
                            <th className="px-2 py-1 text-left font-semibold uppercase tracking-wide">Status</th>
                            <th className="px-2 py-1 text-left font-semibold uppercase tracking-wide">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cr.sales.map((sale) => (
                            <tr key={sale.id} className="border-t border-[var(--border)]">
                              <td className="px-2 py-1.5"><span className="num" style={{ color: 'var(--text-1)' }}>{sale.refNo}</span></td>
                              <td className="px-2 py-1.5 text-[var(--text-2)]">{formatDate(sale.date)}</td>
                              <td className="px-2 py-1.5 text-right"><span className="num" style={{ color: 'var(--text-2)' }}>{formatCurrency(sale.grandTotal)}</span></td>
                              <td className="px-2 py-1.5 text-right"><span className="num" style={{ color: 'var(--text-2)' }}>{formatCurrency(sale.paid)}</span></td>
                              <td className={`px-2 py-1.5 text-right ${sale.balance > 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>
                                <span className="num font-semibold">{formatCurrency(sale.balance)}</span>
                              </td>
                              <td className="px-2 py-1.5">
                                <StatusBadge status={sale.status} />
                              </td>
                              <td className="px-2 py-1.5">
                                {sale.balance > 0 && (
                                  <button
                                    onClick={() =>
                                      onRecordPayment({
                                        saleId: sale.id,
                                        balance: sale.balance,
                                        refNo: sale.refNo,
                                      })
                                    }
                                    className="btn btn-sm btn-green"
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
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
