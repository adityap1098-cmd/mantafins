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

interface SalesBarChartProps {
  data: { customer: string; total: number }[]
  loading: boolean
}

function formatRupiah(v: number): string {
  if (v >= 1_000_000) return 'Rp ' + (v / 1_000_000).toFixed(1) + 'Jt'
  return 'Rp ' + (v / 1_000).toFixed(0) + 'Rb'
}

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
})

export default function SalesBarChart({ data, loading }: SalesBarChartProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Penjualan per Konsumen
      </h3>

      {loading ? (
        <div className="animate-pulse bg-gray-100 rounded h-64" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          Tidak ada data penjualan
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="customer"
              tick={{ fontSize: 11 }}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis tickFormatter={formatRupiah} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) =>
                typeof value === 'number'
                  ? [idrFormatter.format(value), 'Penjualan']
                  : [String(value), 'Penjualan']
              }
            />
            <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
