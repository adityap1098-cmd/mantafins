'use client'

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
    <div className="flex flex-wrap gap-2 items-center">
      <select
        value={customerFilter}
        onChange={(e) => onCustomerChange(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="all">Semua Konsumen</option>
        {customers.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="all">Semua Status</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-1 text-sm text-gray-600">
        Dari
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
      </label>

      <label className="flex items-center gap-1 text-sm text-gray-600">
        Sampai
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
      </label>
    </div>
  )
}
