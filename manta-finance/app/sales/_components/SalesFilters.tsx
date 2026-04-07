'use client'

import DatePicker from '@/app/_components/DatePicker'

interface SalesFiltersProps {
  customerFilter: string
  onCustomerChange: (value: string) => void
  customers: string[]
  statusFilter: string
  onStatusChange: (value: string) => void
  statuses: string[]
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
}

export default function SalesFilters({
  customerFilter,
  onCustomerChange,
  customers,
  statusFilter,
  onStatusChange,
  statuses,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: SalesFiltersProps) {
  return (
    <div
      className="flex flex-wrap gap-2.5 items-center mb-4 p-3.5"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        boxShadow: 'var(--sh-s)',
      }}
    >
      <select
        value={customerFilter}
        onChange={(e) => onCustomerChange(e.target.value)}
        className="f-input"
        style={{ width: 170 }}
      >
        <option value="all">Semua Konsumen</option>
        {customers.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="f-input"
        style={{ width: 140 }}
      >
        <option value="all">Semua Status</option>
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Dari</span>
        <DatePicker value={dateFrom} onChange={onDateFromChange} label="Dari" />
      </div>

      <div className="flex items-center gap-2">
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Sampai</span>
        <DatePicker value={dateTo} onChange={onDateToChange} label="Sampai" />
      </div>
    </div>
  )
}
