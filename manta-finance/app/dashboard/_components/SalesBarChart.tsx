"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users } from "lucide-react";

interface SalesBarChartProps {
  data: { customer: string; total: number }[];
  loading: boolean;
}

function formatRupiah(v: number): string {
  if (v >= 1_000_000) return "Rp " + (v / 1_000_000).toFixed(1) + "Jt";
  return "Rp " + (v / 1_000).toFixed(0) + "Rb";
}

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

export default function SalesBarChart({ data, loading }: SalesBarChartProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Penjualan per Konsumen
        </h3>
      </div>

      {loading ? (
        <div className="animate-pulse bg-secondary rounded h-64" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
          Tidak ada data penjualan
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="customer"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              angle={-30}
              textAnchor="end"
              height={60}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tickFormatter={formatRupiah}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(value) =>
                typeof value === "number"
                  ? [idrFormatter.format(value), "Penjualan"]
                  : [String(value), "Penjualan"]
              }
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
