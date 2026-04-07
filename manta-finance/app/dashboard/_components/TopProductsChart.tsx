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
import { ChartTooltip } from './ChartTooltip'

interface TopProductsChartProps {
  data: { productName: string; qty: number }[]
  loading: boolean
}

export default function TopProductsChart({
  data,
  loading,
}: TopProductsChartProps) {
  return (
    <div className="mr-card p-5">
      <div className="mb-4">
        <h3 className="font-bold" style={{ fontSize: 14, letterSpacing: '-0.2px', color: 'var(--text-1)' }}>
          Top 10 Produk Terlaris
        </h3>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Berdasarkan kuantitas terjual</p>
      </div>

      {loading ? (
        <div className="animate-pulse bg-gray-100 rounded h-64" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          Tidak ada data penjualan
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart layout="vertical" data={data}>
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid horizontal={false} stroke="rgba(0,0,0,0.04)" strokeDasharray="" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              tickCount={6}
            />
            <YAxis
              type="category"
              dataKey="productName"
              width={140}
              tick={{ fontSize: 10.5, fontWeight: 500, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={
                <ChartTooltip formatter={(v) => v + ' pcs'} />
              }
            />
            <Bar dataKey="qty" fill="url(#greenGradient)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
