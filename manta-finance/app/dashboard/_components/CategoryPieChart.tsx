'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type PieLabelRenderProps,
} from 'recharts'

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

function renderLabel(props: PieLabelRenderProps): string {
  const category = props.name ?? ''
  const percent = typeof props.percent === 'number' ? props.percent : 0
  if (!category) return ''
  return `${category} ${(percent * 100).toFixed(1)}%`
}

export default function CategoryPieChart({
  data,
  loading,
}: CategoryPieChartProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Komposisi Penjualan per Kategori
      </h3>

      {loading ? (
        <div className="animate-pulse bg-gray-100 rounded h-64" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
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
              outerRadius={100}
              label={renderLabel}
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) =>
                typeof value === 'number' ? idrFormatter.format(value) : String(value)
              }
            />
            <Legend iconType="circle" iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
