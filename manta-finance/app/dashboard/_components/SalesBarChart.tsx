'use client'

import { useState } from 'react'
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

interface SalesBarChartProps {
  data: { customer: string; total: number; qty: number }[]
  loading: boolean
}

function formatRupiah(v: number): string {
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)} Jt`
  return `Rp ${(v / 1_000).toFixed(0)} Rb`
}

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
})

type ChartMode = 'nominal' | 'qty'

export default function SalesBarChart({ data, loading }: SalesBarChartProps) {
  const [mode, setMode] = useState<ChartMode>('nominal')

  const dataKey = mode === 'nominal' ? 'total' : 'qty'
  const tickFmt = mode === 'nominal' ? formatRupiah : (v: number) => String(v)
  const tooltipFmt = mode === 'nominal' ? (v: number) => idrFormatter.format(v) : (v: number) => v + ' pcs'

  return (
    <div className="mr-card p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold" style={{ fontSize: 14, letterSpacing: '-0.2px', color: 'var(--text-1)' }}>
            Penjualan per Konsumen
          </h3>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Breakdown total penjualan per pelanggan</p>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button
            className={`pill-btn${mode === 'nominal' ? ' active' : ''}`}
            onClick={() => setMode('nominal')}
          >
            Nominal
          </button>
          <button
            className={`pill-btn${mode === 'qty' ? ' active' : ''}`}
            onClick={() => setMode('qty')}
          >
            Qty
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse bg-gray-100 rounded h-64" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          Tidak ada data penjualan
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <defs>
              <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="" stroke="rgba(0,0,0,0.04)" vertical={false} />
            <XAxis
              dataKey="customer"
              tick={{ fontSize: 11, fontWeight: 500, fill: '#6b7280' }}
              angle={-25}
              textAnchor="end"
              height={60}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={tickFmt}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={
                <ChartTooltip formatter={tooltipFmt} />
              }
            />
            <Bar dataKey={dataKey} fill="url(#indigoGradient)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
