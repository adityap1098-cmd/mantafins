'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from './ChartTooltip'

interface CategoryPieChartProps {
  data: { category: string; total: number }[]
  loading: boolean
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
]

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
})

export default function CategoryPieChart({
  data,
  loading,
}: CategoryPieChartProps) {
  return (
    <div className="mr-card p-5">
      <div className="mb-4">
        <h3 className="font-bold" style={{ fontSize: 14, letterSpacing: '-0.2px', color: 'var(--text-1)' }}>
          Komposisi per Kategori
        </h3>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Distribusi penjualan berdasarkan kategori</p>
      </div>

      {loading ? (
        <div className="animate-pulse bg-gray-100 rounded h-64" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          Tidak ada data penjualan
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={100}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={
                <ChartTooltip formatter={(v) => idrFormatter.format(v)} />
              }
            />
            <Legend
              iconType="circle"
              iconSize={8}
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 14, fontSize: '11.5px', fontWeight: 500 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
