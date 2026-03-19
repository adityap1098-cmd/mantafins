"use client";

import { DollarSign, Tag, TrendingUp } from "lucide-react";
import type { InventorySummary } from "@/app/api/stock/route";

interface InventorySummaryBarProps {
  summary: InventorySummary | null;
  loading: boolean;
}

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function InventorySummaryBar({
  summary,
  loading,
}: InventorySummaryBarProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-4 animate-pulse"
          >
            <div className="h-4 bg-secondary rounded w-32 mb-2" />
            <div className="h-7 bg-secondary rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-sm text-muted-foreground py-3 bg-card rounded-xl border border-border px-4">
        Pilih periode untuk melihat ringkasan
      </div>
    );
  }

  const stats = [
    {
      label: "Total Nilai HPP",
      value: idr.format(summary.totalHppValue),
      icon: DollarSign,
      colorClass: "text-muted-foreground",
    },
    {
      label: "Total Nilai Harga Jual",
      value: idr.format(summary.totalHargaJualValue),
      icon: Tag,
      colorClass: "text-primary",
    },
    {
      label: "Potensi Profit",
      value: idr.format(summary.potentialProfit),
      icon: TrendingUp,
      colorClass: "text-success",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg bg-secondary ${stat.colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
            <p className={`text-xl font-bold ${stat.colorClass}`}>
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
