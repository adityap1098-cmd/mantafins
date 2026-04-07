'use client'

import { useState, useEffect, useMemo } from 'react'
import PeriodSelector from '@/app/dashboard/_components/PeriodSelector'
import SalesFilters from './SalesFilters'
import SalesTable from './SalesTable'
import type { SaleRow } from '@/app/api/sales/route'

type SortKey = 'date' | 'grandTotal' | 'marginPersen'

export default function SalesClient() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null)
  const [rows, setRows] = useState<SaleRow[]>([])
  const [loading, setLoading] = useState(false)

  const [customerFilter, setCustomerFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    if (!selectedPeriodId) return

    setLoading(true)
    fetch(`/api/sales?periodId=${selectedPeriodId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch sales')
        return res.json() as Promise<{ rows: SaleRow[] }>
      })
      .then((data) => setRows(data.rows))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [selectedPeriodId])

  const customers = useMemo(() => Array.from(new Set(rows.map((r) => r.customer))).sort(), [rows])
  const statuses = useMemo(() => Array.from(new Set(rows.map((r) => r.status))).sort(), [rows])

  const filteredRows = useMemo(() => {
    let result = rows
    if (customerFilter !== 'all') result = result.filter((r) => r.customer === customerFilter)
    if (statusFilter !== 'all') result = result.filter((r) => r.status === statusFilter)
    if (dateFrom) result = result.filter((r) => new Date(r.date) >= new Date(dateFrom))
    if (dateTo) result = result.filter((r) => new Date(r.date) <= new Date(dateTo + 'T23:59:59'))

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = sortKey === 'date' ? new Date(a.date).getTime() : a[sortKey]
        const bVal = sortKey === 'date' ? new Date(b.date).getTime() : b[sortKey]
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [rows, customerFilter, statusFilter, dateFrom, dateTo, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header anim-up d1">
        <div>
          <h1 className="page-title">Penjualan</h1>
          <p className="page-subtitle">Riwayat transaksi penjualan</p>
        </div>
        <PeriodSelector selectedPeriodId={selectedPeriodId} onChange={setSelectedPeriodId} />
      </div>

      {/* Filters */}
      <div className="anim-up d2">
        <SalesFilters
          customerFilter={customerFilter}
          onCustomerChange={setCustomerFilter}
          customers={customers}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statuses={statuses}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
        />
      </div>

      {/* Table */}
      <div className="anim-up d3">
        <SalesTable
          rows={filteredRows}
          loading={loading}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
      </div>
    </div>
  )
}
