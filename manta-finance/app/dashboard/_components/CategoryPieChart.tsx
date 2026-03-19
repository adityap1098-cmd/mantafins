"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type PieLabelRenderProps,
} from "recharts";
import { PieChartIcon } from "lucide-react";

interface CategoryPieChartProps {
  data: { category: string; total: number }[];
  loading: boolean;
}

// Cyan/teal-based color palette for dark theme
const COLORS = [
  "#06b6d4", // cyan-500
  "#14b8a6", // teal-500
  "#10b981", // emerald-500
  "#22d3ee", // cyan-400
  "#2dd4bf", // teal-400
  "#34d399", // emerald-400
  "#0891b2", // cyan-600
  "#0d9488", // teal-600
];

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

function renderLabel(props: PieLabelRenderProps): string {
  const percent = typeof props.percent === "number" ? props.percent : 0;
  if (percent < 0.05) return "";
  return `${(percent * 100).toFixed(0)}%`;
}

export default function CategoryPieChart({
  data,
  loading,
}: CategoryPieChartProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Komposisi Penjualan per Kategori
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
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={50}
              label={renderLabel}
              labelLine={false}
              stroke="hsl(var(--card))"
              strokeWidth={2}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(value) =>
                typeof value === "number"
                  ? idrFormatter.format(value)
                  : String(value)
              }
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value) => (
                <span className="text-muted-foreground text-xs">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
