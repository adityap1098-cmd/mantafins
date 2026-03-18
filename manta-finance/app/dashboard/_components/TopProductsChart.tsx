'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TopProductsChartProps {
  data: { productName: string; qty: number }[]
  loading: boolean
}

export default function TopProductsChart({
  data,
  loading,
}: TopProductsChartProps) {
  const chartHeight = Math.max(300, data.length * 40)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Top 10 Produk Terlaris (by Qty)
      </h3>

      {loading ? (
        <div className="animate-pulse bg-gray-100 rounded h-64" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          Tidak ada data penjualan
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart layout="vertical" data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="productName"
              width={180}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === 'number'
                  ? [value + ' pcs', 'Qty']
                  : [String(value), 'Qty']
              }
            />
            <Bar dataKey="qty" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
