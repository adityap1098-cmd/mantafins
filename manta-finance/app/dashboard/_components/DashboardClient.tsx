'use client'

import { useState, useEffect } from 'react'
import type { DashboardData } from '@/app/api/dashboard/route'
import SummaryCards from './SummaryCards'
import PeriodSelector from './PeriodSelector'

export default function DashboardClient() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedPeriodId) return

    let cancelled = false
    setLoading(true)

    fetch(`/api/dashboard?periodId=${selectedPeriodId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch dashboard data')
        return res.json() as Promise<DashboardData>
      })
      .then((data) => {
        if (!cancelled) {
          setDashboardData(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDashboardData(null)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectedPeriodId])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Ringkasan Periode</h2>
        <PeriodSelector
          selectedPeriodId={selectedPeriodId}
          onChange={setSelectedPeriodId}
        />
      </div>
      <SummaryCards summary={dashboardData?.summary ?? null} loading={loading} />
      {/* Charts placeholder — Plan 03 will replace this */}
      <div
        id="charts-placeholder"
        className="text-gray-400 text-sm text-center py-8"
      >
        Grafik akan tersedia setelah komponen chart dibuat.
      </div>
    </div>
  )
}
