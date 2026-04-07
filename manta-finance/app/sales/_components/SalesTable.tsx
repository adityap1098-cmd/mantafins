'use client'

import React, { useState } from 'react'
import type { SaleRow } from '@/app/api/sales/route'
import { TruncatedCell } from '@/app/_components/TruncatedCell'
import { ChevronUp, ChevronDown, ChevronsUpDown, X } from 'lucide-react'

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

function formatCurrency(n: number) { return idr.format(n) }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
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

function MarginCell({ persen }: { persen: number }) {
  const cls = persen >= 60 ? 'pct-good' : persen >= 40 ? 'pct-warn' : 'pct-bad'
  return <span className={`num ${cls}`}>{persen.toFixed(1)}%</span>
}

const SALES_COLUMNS = [
  { key: 'date',         label: 'Tanggal',     required: true },
  { key: 'refNo',        label: 'No Ref',      required: false },
  { key: 'customer',     label: 'Konsumen',    required: true },
  { key: 'itemCount',    label: 'Jml Item',    required: false },
  { key: 'grandTotal',   label: 'Grand Total', required: true },
  { key: 'totalHpp',     label: 'HPP Total',   required: false },
  { key: 'labaKotor',    label: 'Laba Kotor',  required: false },
  { key: 'diskon',       label: 'Diskon',      required: false },
  { key: 'marginPersen', label: 'Margin %',    required: false },
  { key: 'status',       label: 'Status',      required: false },
]

type SortKey = 'date' | 'grandTotal' | 'marginPersen'

interface SalesTableProps {
  rows: SaleRow[]
  loading?: boolean
  sortKey: SortKey | null
  sortDir: 'asc' | 'desc'
  onSort: (key: SortKey) => void
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey | null; sortDir: 'asc' | 'desc' }) {
  if (sortKey !== col) return <ChevronsUpDown size={12} className="inline ml-1 opacity-40" />
  return sortDir === 'asc'
    ? <ChevronUp size={12} className="inline ml-1" style={{ color: 'var(--accent)' }} />
    : <ChevronDown size={12} className="inline ml-1" style={{ color: 'var(--accent)' }} />
}

function renderCell(row: SaleRow, key: string): React.ReactNode {
  switch (key) {
    case 'date':         return <td key={key}>{formatDate(row.date)}</td>
    case 'refNo':        return <td key={key}><span className="num" style={{ color: 'var(--text-3)', fontSize: 11 }}>{row.refNo}</span></td>
    case 'customer':     return <td key={key} style={{ fontWeight: 600 }}>{row.customer}</td>
    case 'itemCount':    return <td key={key} className="text-center"><span className="num">{row.itemCount}</span></td>
    case 'grandTotal':   return <td key={key} className="text-right"><span className="num">{formatCurrency(row.grandTotal)}</span></td>
    case 'totalHpp':     return <td key={key} className="text-right"><span className="num" style={{ color: 'var(--text-2)' }}>{formatCurrency(row.totalHpp)}</span></td>
    case 'labaKotor':    return <td key={key} className="text-right"><span className="num" style={{ color: 'var(--green)' }}>{formatCurrency(row.labaKotor)}</span></td>
    case 'diskon':       return <td key={key} className="text-right"><span className="num" style={{ color: 'var(--red)' }}>{formatCurrency(row.diskon)}</span></td>
    case 'marginPersen': return <td key={key} className="text-right"><MarginCell persen={row.marginPersen} /></td>
    case 'status':       return <td key={key} className="text-center"><StatusBadge status={row.status} /></td>
    default:             return <td key={key} />
  }
}

export default function SalesTable({ rows, loading = false, sortKey, sortDir, onSort }: SalesTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [visibleCols, setVisibleCols] = useState<Set<string>>(() => new Set(SALES_COLUMNS.map((c) => c.key)))

  function toggleCol(key: string) {
    const col = SALES_COLUMNS.find((c) => c.key === key)
    if (!col || col.required) return
    setVisibleCols((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const totals = rows.reduce(
    (acc, r) => ({ grandTotal: acc.grandTotal + r.grandTotal, totalHpp: acc.totalHpp + r.totalHpp, labaKotor: acc.labaKotor + r.labaKotor }),
    { grandTotal: 0, totalHpp: 0, labaKotor: 0 }
  )

  // Column toggles
  const columnToggles = (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {SALES_COLUMNS.filter((c) => !c.required).map((c) => (
        <button
          key={c.key}
          onClick={() => toggleCol(c.key)}
          className={`pill-btn ${visibleCols.has(c.key) ? 'active' : ''}`}
        >
          {c.label}
        </button>
      ))}
    </div>
  )

  if (loading) {
    return (
      <>
        {columnToggles}
        <div className="mr-card overflow-hidden" style={{ padding: 0 }}>
          <table className="mr-table">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j}><div className="h-3 bg-gray-100 rounded" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  if (rows.length === 0) {
    return (
      <>
        {columnToggles}
        <div className="text-sm py-10 text-center" style={{ color: 'var(--text-3)' }}>
          Tidak ada transaksi untuk periode ini.
        </div>
      </>
    )
  }

  const visibleColumnDefs = SALES_COLUMNS.filter((c) => visibleCols.has(c.key))

  return (
    <>
      {columnToggles}
      <div className="mr-card overflow-hidden" style={{ padding: 0 }}>
        <div className="mr-table-wrap">
          <table className="mr-table">
            <thead>
              <tr>
                {visibleColumnDefs.map((c) => {
                  const sortable = ['date', 'grandTotal', 'marginPersen'].includes(c.key)
                  return (
                    <th
                      key={c.key}
                      onClick={sortable ? () => onSort(c.key as SortKey) : undefined}
                      style={{ cursor: sortable ? 'pointer' : 'default', textAlign: ['grandTotal','totalHpp','labaKotor','diskon','marginPersen','itemCount'].includes(c.key) ? 'right' : 'left' }}
                    >
                      {c.label}
                      {sortable && <SortIcon col={c.key as SortKey} sortKey={sortKey} sortDir={sortDir} />}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {visibleColumnDefs.map((c) => renderCell(row, c.key))}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr>
                {visibleColumnDefs.map((c, i) => {
                  if (i === 0) return <td key={c.key} style={{ fontSize: 12, color: 'var(--text-2)', textTransform: 'uppercase' }}>Total ({rows.length} transaksi)</td>
                  if (c.key === 'grandTotal') return <td key={c.key} className="text-right"><span className="num">{formatCurrency(totals.grandTotal)}</span></td>
                  if (c.key === 'totalHpp')   return <td key={c.key} className="text-right"><span className="num">{formatCurrency(totals.totalHpp)}</span></td>
                  if (c.key === 'labaKotor')  return <td key={c.key} className="text-right"><span className="num" style={{ color: 'var(--green)' }}>{formatCurrency(totals.labaKotor)}</span></td>
                  return <td key={c.key} />
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Side drawer */}
      {expandedId && (() => {
        const row = rows.find((r) => r.id === expandedId)
        if (!row) return null
        return (
          <>
            <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.2)' }} onClick={() => setExpandedId(null)} />
            <div className="fixed right-0 top-0 h-full z-50 overflow-y-auto" style={{ width: 480, background: 'var(--bg-surface)', boxShadow: 'var(--sh-l)' }}>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>Detail Transaksi</h2>
                <button onClick={() => setExpandedId(null)} style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
              <div className="p-5">
                <table className="w-full" style={{ fontSize: 13 }}>
                  <thead>
                    <tr style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>
                      <th className="text-left py-2 pr-3">SKU</th>
                      <th className="text-left py-2 pr-3">Produk</th>
                      <th className="text-right py-2 pr-3">Qty</th>
                      <th className="text-right py-2 pr-3">HPP</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {row.items.map((item) => (
                      <tr key={item.sku} style={{ borderBottom: '1px solid #f1f3f5' }}>
                        <td className="py-2 pr-3"><span className="num" style={{ color: 'var(--text-3)', fontSize: 11 }}>{item.sku}</span></td>
                        <td className="py-2 pr-3"><TruncatedCell text={item.productName} maxWidth="max-w-[180px]" /></td>
                        <td className="text-right py-2 pr-3"><span className="num">{item.qty}</span></td>
                        <td className="text-right py-2 pr-3"><span className="num">{formatCurrency(item.totalHpp)}</span></td>
                        <td className="text-right py-2"><span className="num">{formatCurrency(item.totalHarga)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      })()}
    </>
  )
}
