'use client'

import { useEffect, useState } from 'react'

interface Period {
  id: string
  name: string
  month: number
  year: number
  createdAt: string
}

interface PeriodSelectorProps {
  selectedPeriodId: string | null
  onChange: (id: string) => void
}

export default function PeriodSelector({
  selectedPeriodId,
  onChange,
}: PeriodSelectorProps) {
  const [periods, setPeriods] = useState<Period[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch('/api/periods')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch periods')
        return res.json() as Promise<{ periods: Period[] }>
      })
      .then((data) => {
        if (cancelled) return
        const sorted = [...data.periods].sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year
          return b.month - a.month
        })
        setPeriods(sorted)
        // Auto-select first period if none selected and periods are available
        if (!selectedPeriodId && sorted.length > 0) {
          onChange(sorted[0].id)
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <span className="text-sm text-red-500">Gagal memuat periode</span>
    )
  }

  return (
    <select
      value={selectedPeriodId ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="" disabled>
        Pilih Periode
      </option>
      {periods.map((period) => (
        <option key={period.id} value={period.id}>
          {period.name}
        </option>
      ))}
    </select>
  )
}
