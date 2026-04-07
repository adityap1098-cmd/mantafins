'use client'

import { useState, useEffect } from 'react'
import DatePicker from '@/app/_components/DatePicker'

function estimateFileSize(counts: Partial<Record<SheetKey, number>>, selectedKeys: SheetKey[]): string {
  const BYTES_PER_ROW = 2048   // ~2 KB per data row (Excel cell overhead)
  const BYTES_PER_SHEET = 15360 // ~15 KB base per sheet (headers, formatting)
  let total = 0
  for (const key of selectedKeys) {
    const rows = counts[key] ?? 0
    total += BYTES_PER_SHEET + rows * BYTES_PER_ROW
  }
  if (total < 1024 * 1024) {
    return `~${Math.ceil(total / 1024)} KB`
  }
  return `~${(total / (1024 * 1024)).toFixed(1)} MB`
}

type SheetKey =
  | 'laporanKeuangan'
  | 'transaksi'
  | 'detailItem'
  | 'piutang'
  | 'stock'
  | 'marginProduk'
  | 'marginKonsumen'

const SHEET_META: Record<SheetKey, { label: string; description: string; icon: React.ReactElement }> = {
  laporanKeuangan: {
    label: 'Laporan Keuangan',
    description: 'P&L summary, margin, piutang',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="12" width="4" height="10" rx="1" />
        <rect x="10" y="8" width="4" height="14" rx="1" />
        <rect x="18" y="4" width="4" height="18" rx="1" />
      </svg>
    ),
  },
  transaksi: {
    label: 'Transaksi',
    description: 'Semua transaksi penjualan',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  detailItem: {
    label: 'Detail Item',
    description: 'Rincian per item transaksi',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  piutang: {
    label: 'Piutang',
    description: 'Aging dan status pembayaran',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V22H4V12" />
        <path d="M22 7H2v5h20V7z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  stock: {
    label: 'Stock',
    description: 'Inventori produk dan harga',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  marginProduk: {
    label: 'Margin Produk',
    description: 'Margin per produk terjual',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  marginKonsumen: {
    label: 'Margin Konsumen',
    description: 'Diskon rata-rata per konsumen',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
}

const ALL_SHEET_KEYS: SheetKey[] = [
  'laporanKeuangan',
  'transaksi',
  'detailItem',
  'piutang',
  'stock',
  'marginProduk',
  'marginKonsumen',
]

const DEFAULT_SHEETS: Record<SheetKey, boolean> = {
  laporanKeuangan: true,
  transaksi: true,
  detailItem: true,
  piutang: true,
  stock: true,
  marginProduk: true,
  marginKonsumen: true,
}

interface Period {
  id: string
  name: string
}

interface Props {
  periods: Period[]
}

export default function ExportClient({ periods }: Props) {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    periods.length > 0 ? periods[0].id : ''
  )
  const [sheets, setSheets] = useState<Record<SheetKey, boolean>>({ ...DEFAULT_SHEETS })
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    customer: '',
    category: '',
    paymentStatus: 'all' as 'all' | 'paid' | 'unpaid',
  })
  const [previewCounts, setPreviewCounts] = useState<Partial<Record<SheetKey, number>>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedPeriodId) return
    fetch(`/api/export/preview?periodId=${encodeURIComponent(selectedPeriodId)}`)
      .then((res) => res.json())
      .then((data: Partial<Record<SheetKey, number>>) => setPreviewCounts(data))
      .catch(() => setPreviewCounts({}))
  }, [selectedPeriodId])

  const selectedSheetKeys = ALL_SHEET_KEYS.filter((k) => sheets[k])

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId)
  const periodLabel = selectedPeriod ? selectedPeriod.name.replace(/\s+/g, '-') : ''

  async function handleExport() {
    if (!selectedPeriodId || loading) return
    setError(null)
    setLoading(true)
    try {
      const config = {
        periodId: selectedPeriodId,
        periodLabel,
        sheets: selectedSheetKeys,
        filters: {
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          customer: filters.customer || undefined,
          category: filters.category || undefined,
          paymentStatus: filters.paymentStatus,
        },
      }
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!res.ok) {
        const text = await res.text()
        setError(text || 'Export failed. Please try again.')
        setLoading(false)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Manta-Racing-Export-${periodLabel}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error during export.')
    } finally {
      setLoading(false)
    }
  }

  const allSelected = ALL_SHEET_KEYS.every((k) => sheets[k])

  return (
    <div>
      <div className="page-header anim-up d1">
        <div>
          <h1 className="page-title">Export Data</h1>
          <p className="page-subtitle">Unduh laporan Excel</p>
        </div>
      </div>
      <div className="resp-grid-export">
        {/* Left panel — config */}
        <div className="space-y-5">
          {/* Period selector */}
          <div className="mr-card p-5 anim-up d2">
            <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px', marginBottom: 14 }}>Periode</h3>
            {periods.length === 0 ? (
              <p className="text-sm text-[var(--text-3)]">Tidak ada periode tersedia.</p>
            ) : (
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="f-input w-full"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Sheet selection */}
          <div className="mr-card p-5 anim-up d3">
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}>Sheet yang Diekspor</h3>
              <button
                type="button"
                onClick={() => {
                  const newState = {} as Record<SheetKey, boolean>
                  for (const k of ALL_SHEET_KEYS) newState[k] = !allSelected
                  setSheets(newState)
                }}
                className="btn btn-sm"
                style={
                  allSelected
                    ? { color: 'var(--text-2)', borderColor: 'var(--border)', background: 'var(--bg-surface-hover)' }
                    : { color: 'var(--accent)', borderColor: 'var(--accent)', background: 'var(--accent-bg)' }
                }
              >
                {allSelected ? 'Hapus Semua' : 'Pilih Semua'}
              </button>
            </div>
            <div>
              {ALL_SHEET_KEYS.map((key) => {
                const meta = SHEET_META[key]
                return (
                  <div key={key} className={`check-item${sheets[key] ? ' active' : ''}`}>
                    <input
                      type="checkbox"
                      id={`sheet-${key}`}
                      checked={sheets[key]}
                      onChange={(e) =>
                        setSheets((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                    />
                    <div className="check-icon">{meta.icon}</div>
                    <div className="check-text">
                      <label htmlFor={`sheet-${key}`}>{meta.label}</label>
                      <span className="check-desc">{meta.description}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="mr-card p-5 anim-up d4">
            <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px', marginBottom: 14 }}>Filter (Opsional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--text-3)] mb-1.5">Tanggal Dari</label>
                <DatePicker
                  value={filters.dateFrom}
                  onChange={(v) => setFilters((f) => ({ ...f, dateFrom: v }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-3)] mb-1.5">Tanggal Sampai</label>
                <DatePicker
                  value={filters.dateTo}
                  onChange={(v) => setFilters((f) => ({ ...f, dateTo: v }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-3)] mb-1.5">Customer</label>
                <input
                  type="text"
                  value={filters.customer}
                  onChange={(e) => setFilters((f) => ({ ...f, customer: e.target.value }))}
                  placeholder="Nama customer..."
                  className="f-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-3)] mb-1.5">Kategori</label>
                <input
                  type="text"
                  value={filters.category}
                  onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                  placeholder="Nama kategori..."
                  className="f-input w-full"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[var(--text-3)] mb-1.5">Status Pembayaran</label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      paymentStatus: e.target.value as 'all' | 'paid' | 'unpaid',
                    }))
                  }
                  className="f-input w-full"
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — preview */}
        <div>
          <div className="mr-card p-5 sticky" style={{ top: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px', marginBottom: 16 }}>Preview Export</h3>
            {selectedSheetKeys.length === 0 ? (
              <p className="text-sm text-[var(--text-3)] mb-4">Pilih minimal satu sheet.</p>
            ) : (
              <div className="mb-4">
                {selectedSheetKeys.map((key) => (
                  <div key={key} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-2)' }}>{SHEET_META[key].label}</span>
                    <span className="font-mono" style={{ color: 'var(--text-2)' }}>
                      {previewCounts[key] !== undefined ? previewCounts[key] : '-'} baris
                    </span>
                  </div>
                ))}
                <div style={{ borderTop: '2px solid var(--border)', marginTop: 12, paddingTop: 12 }}>
                  {Object.keys(previewCounts).length > 0 && (
                    <div
                      data-testid="export-size-estimate"
                      className="flex items-center justify-between"
                      style={{ fontSize: 13, marginBottom: 4 }}
                    >
                      <span style={{ color: 'var(--text-2)' }}>Estimasi ukuran</span>
                      <span className="font-mono" style={{ fontWeight: 600 }}>
                        {estimateFileSize(previewCounts, selectedSheetKeys)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between" style={{ fontSize: 13 }}>
                    <span style={{ color: 'var(--text-2)' }}>Total sheet</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>{selectedSheetKeys.length} / 7</span>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div data-testid="export-spinner" className="flex items-center justify-center gap-2 py-3 text-sm text-[var(--accent)]">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Generating export...</span>
              </div>
            )}

            <button
              onClick={handleExport}
              disabled={loading || !selectedPeriodId || selectedSheetKeys.length === 0}
              className="ex-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export Excel
            </button>

            {error && (
              <p className="mt-3 text-xs text-[var(--red)] bg-[var(--red-bg)] rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
