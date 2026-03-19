"use client";

import { useState, useEffect } from "react";
import type { DashboardData } from "@/app/api/dashboard/route";
import SummaryCards from "./SummaryCards";
import PeriodSelector from "./PeriodSelector";
import SalesBarChart from "./SalesBarChart";
import CategoryPieChart from "./CategoryPieChart";
import TopProductsChart from "./TopProductsChart";

export default function DashboardClient() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedPeriodId) return;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/dashboard?periodId=${selectedPeriodId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json() as Promise<DashboardData>;
      })
      .then((data) => {
        if (!cancelled) {
          setDashboardData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDashboardData(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPeriodId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ringkasan keuangan periode berjalan
          </p>
        </div>
        <PeriodSelector
          selectedPeriodId={selectedPeriodId}
          onChange={setSelectedPeriodId}
        />
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={dashboardData?.summary ?? null} loading={loading} />

      {/* Sales by Customer Chart */}
      <SalesBarChart
        data={dashboardData?.salesByCustomer ?? []}
        loading={loading}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
  );
}
