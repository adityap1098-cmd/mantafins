'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import PeriodSelector from '@/app/dashboard/_components/PeriodSelector'
import type { StockRow, InventorySummary } from '@/app/api/stock/route'
import InventorySummaryBar from './InventorySummaryBar'
import StockFilters from './StockFilters'
import StockTable from './StockTable'

export default function StockClient() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null)
  const [rows, setRows] = useState<StockRow[]>([])
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null)
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [hppMin, setHppMin] = useState('')
  const [hppMax, setHppMax] = useState('')
  const [stockMin, setStockMin] = useState('')
  const [stockMax, setStockMax] = useState('')

  const [sortKey, setSortKey] = useState<keyof StockRow | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    if (!selectedPeriodId) return

    let cancelled = false
    setLoading(true)

    fetch(`/api/stock?periodId=${selectedPeriodId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch stock')
        return res.json() as Promise<{ rows: StockRow[]; inventorySummary: InventorySummary }>
      })
      .then((data) => {
        if (cancelled) return
        setRows(data.rows)
        setInventorySummary(data.inventorySummary)
      })
      .catch((err) => {
        if (!cancelled) console.error('Stock fetch error:', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedPeriodId])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(rows.map((r) => r.category)))
    return unique.sort((a, b) => a.localeCompare(b))
  }, [rows])

  const filteredRows = useMemo(() => {
    let result = rows

    if (search) {
      const lower = search.toLowerCase()
      result = result.filter(
        (r) => r.name.toLowerCase().includes(lower) || r.sku.toLowerCase().includes(lower)
      )
    }

    if (categoryFilter !== 'all') result = result.filter((r) => r.category === categoryFilter)
    if (hppMin !== '') { const min = parseFloat(hppMin); if (!isNaN(min)) result = result.filter((r) => r.hpp >= min) }
    if (hppMax !== '') { const max = parseFloat(hppMax); if (!isNaN(max)) result = result.filter((r) => r.hpp <= max) }
    if (stockMin !== '') { const min = parseInt(stockMin, 10); if (!isNaN(min)) result = result.filter((r) => r.stock >= min) }
    if (stockMax !== '') { const max = parseInt(stockMax, 10); if (!isNaN(max)) result = result.filter((r) => r.stock <= max) }

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal
        }
        return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal))
      })
    }

    return result
  }, [rows, search, categoryFilter, hppMin, hppMax, stockMin, stockMax, sortKey, sortDir])

  const handleSort = useCallback(
    (key: keyof StockRow) => {
      if (sortKey === key) setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      else { setSortKey(key); setSortDir('asc') }
    },
    [sortKey]
  )

  const handleStockEdit = useCallback(
    async (sku: string, newStock: number) => {
      const previousRows = rows
      const updatedRows = rows.map((r) => r.sku === sku ? { ...r, stock: newStock } : r)
      setRows(updatedRows)

      const totalHppValue = updatedRows.reduce((sum, r) => sum + r.hpp * r.stock, 0)
      const totalHargaJualValue = updatedRows.reduce((sum, r) => sum + r.hargaJual * r.stock, 0)
      setInventorySummary({ totalHppValue, totalHargaJualValue, potentialProfit: totalHargaJualValue - totalHppValue })

      try {
        const res = await fetch(`/api/stock/${encodeURIComponent(sku)}?periodId=${selectedPeriodId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: newStock }),
        })
        if (!res.ok) throw new Error('PATCH failed')
      } catch (err) {
        console.error('Stock edit error:', err)
        setRows(previousRows)
        const revertedHppValue = previousRows.reduce((sum, r) => sum + r.hpp * r.stock, 0)
        const revertedHargaJualValue = previousRows.reduce((sum, r) => sum + r.hargaJual * r.stock, 0)
        setInventorySummary({ totalHppValue: revertedHppValue, totalHargaJualValue: revertedHargaJualValue, potentialProfit: revertedHargaJualValue - revertedHppValue })
      }
    },
    [rows, selectedPeriodId]
  )

  return (
    <div>
      {/* Page Header */}
      <div className="page-header anim-up d1">
        <div>
          <h1 className="page-title">Stok Produk</h1>
          <p className="page-subtitle">Inventaris dan margin per produk</p>
        </div>
        <PeriodSelector selectedPeriodId={selectedPeriodId} onChange={setSelectedPeriodId} />
      </div>

      {/* KPI Cards */}
      <div className="anim-up d2">
        <InventorySummaryBar summary={inventorySummary} loading={loading} />
      </div>

      {/* Filters */}
      <div className="anim-up d3">
        <StockFilters
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categories={categories}
          hppMin={hppMin}
          hppMax={hppMax}
          onHppMinChange={setHppMin}
          onHppMaxChange={setHppMax}
          stockMin={stockMin}
          stockMax={stockMax}
          onStockMinChange={setStockMin}
          onStockMaxChange={setStockMax}
        />
      </div>

      {/* Table */}
      <div className="anim-up d4">
        <StockTable
          rows={filteredRows}
          loading={loading}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onStockEdit={handleStockEdit}
        />
      </div>
    </div>
  )
}
