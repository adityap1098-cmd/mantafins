'use client'

import { useState, useEffect } from 'react'
import type { DashboardData } from '@/app/api/dashboard/route'
import SummaryCards from './SummaryCards'
import RingIndicators from './RingIndicators'
import PeriodSelector from './PeriodSelector'
import SalesBarChart from './SalesBarChart'
import CategoryPieChart from './CategoryPieChart'
import TopProductsChart from './TopProductsChart'

export default function DashboardClient() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>('all')
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
    <div>
      {/* Page Header */}
      <div className="page-header anim-up d1">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Ringkasan keuangan bisnis kamu</p>
        </div>
        <PeriodSelector
          selectedPeriodId={selectedPeriodId}
          onChange={setSelectedPeriodId}
        />
      </div>

      {/* KPI Cards */}
      <div className="anim-up d2">
        <SummaryCards
          summary={dashboardData?.summary ?? null}
          previousSummary={dashboardData?.previousSummary ?? null}
          loading={loading}
        />
      </div>

      {/* Ring Indicators */}
      {dashboardData?.summary && (
        <RingIndicators summary={dashboardData.summary} />
      )}

      {/* Sales Bar Chart */}
      <div className="anim-up d5">
        <SalesBarChart
          data={dashboardData?.salesByCustomer ?? []}
          loading={loading}
        />
      </div>

      {/* Chart row: Category pie + Top products — 1.4fr 1fr */}
      <div className="anim-up d6 resp-grid-chart-2">
        <CategoryPieChart
          data={dashboardData?.salesByCategory ?? []}
          loading={loading}
        />
        <TopProductsChart
          data={dashboardData?.topProducts ?? []}
          loading={loading}
        />
      </div>
    </div>
  )
}
