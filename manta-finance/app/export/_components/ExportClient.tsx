'use client'

import { useState, useEffect } from 'react'

type SheetKey =
  | 'laporanKeuangan'
  | 'transaksi'
  | 'detailItem'
  | 'piutang'
  | 'stock'
  | 'marginProduk'
  | 'marginKonsumen'

const SHEET_LABELS: Record<SheetKey, string> = {
  laporanKeuangan: 'Laporan Keuangan (P&L)',
  transaksi: 'Transaksi',
  detailItem: 'Detail Item',
  piutang: 'Piutang',
  stock: 'Stock',
  marginProduk: 'Margin Produk',
  marginKonsumen: 'Margin Konsumen',
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Export Excel</h2>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left panel — config */}
        <div className="lg:col-span-3 space-y-6">
          {/* Period selector */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Periode</h3>
            {periods.length === 0 ? (
              <p className="text-sm text-gray-400">Tidak ada periode tersedia.</p>
            ) : (
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Sheet yang Diekspor</h3>
            <div className="space-y-2">
              {ALL_SHEET_KEYS.map((key) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sheets[key]}
                    onChange={(e) =>
                      setSheets((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{SHEET_LABELS[key]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter (Opsional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tanggal Dari</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tanggal Sampai</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Customer</label>
                <input
                  type="text"
                  value={filters.customer}
                  onChange={(e) => setFilters((f) => ({ ...f, customer: e.target.value }))}
                  placeholder="Nama customer..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Kategori</label>
                <input
                  type="text"
                  value={filters.category}
                  onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                  placeholder="Nama kategori..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Status Pembayaran</label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      paymentStatus: e.target.value as 'all' | 'paid' | 'unpaid',
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Preview Export</h3>
            {selectedSheetKeys.length === 0 ? (
              <p className="text-sm text-gray-400 mb-4">Pilih minimal satu sheet.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {selectedSheetKeys.map((key) => (
                  <div key={key} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-700">{SHEET_LABELS[key]}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {previewCounts[key] !== undefined ? previewCounts[key] : '-'} baris
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                  <span>Total sheet dipilih</span>
                  <span className="font-semibold">{selectedSheetKeys.length} / 7</span>
                </div>
              </div>
            )}

            <button
              onClick={handleExport}
              disabled={loading || !selectedPeriodId || selectedSheetKeys.length === 0}
              className="w-full bg-blue-600 text-white text-sm font-semibold py-2.5 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating...' : 'Export Excel'}
            </button>

            {error && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
