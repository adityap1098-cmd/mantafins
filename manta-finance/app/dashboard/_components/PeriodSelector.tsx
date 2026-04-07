'use client'

import { useEffect, useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

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
        if (!selectedPeriodId) {
          onChange('all')
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
    return <span className="text-sm" style={{ color: 'var(--red)' }}>Gagal memuat periode</span>
  }

  const selected = periods.find((p) => p.id === selectedPeriodId)

  return (
    <div className="relative">
      <select
        value={selectedPeriodId ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="period-pill pr-8"
        style={{ cursor: 'pointer' }}
      >
        <option value="" disabled>Pilih Periode</option>
        <option value="all">Semua Periode</option>
        {periods.map((period) => (
          <option key={period.id} value={period.id}>
            {period.name}
          </option>
        ))}
      </select>
      <Calendar
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--text-3)' }}
      />
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--text-3)' }}
      />
      <style>{`
        .period-pill select { padding-left: 28px !important; }
      `}</style>
    </div>
  )
}
