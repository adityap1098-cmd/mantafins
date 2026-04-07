'use client'

import type { PeriodSummary } from '@/lib/calculator/margin'

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })

export default function RingIndicators({ summary }: { summary: PeriodSummary }) {
  const totalPiutang = summary.totalPiutang
  const totalTerbayar = summary.totalTerbayar
  const marginPersen = summary.marginPersen
  const totalAll = totalPiutang + totalTerbayar
  const piutangPct = totalAll > 0 ? Math.round((totalPiutang / totalAll) * 100) : 0
  const terbayarPct = totalAll > 0 ? Math.round((totalTerbayar / totalAll) * 100) : 0
  const r = 22
  const circumference = 2 * Math.PI * r

  const rings = [
    { label: 'Piutang Aktif', value: idr.format(totalPiutang), pct: piutangPct, color: 'var(--red)' },
    { label: 'Sudah Terbayar', value: idr.format(totalTerbayar), pct: terbayarPct, color: 'var(--green)' },
    { label: 'Margin', value: `${marginPersen.toFixed(2)}%`, pct: Math.round(marginPersen), color: 'var(--accent)' },
  ]

  return (
    <div className="anim-up d4 resp-grid-3" style={{ marginBottom: 20 }}>
      {rings.map(({ label, value, pct, color }) => (
        <div key={label} className="ring-card">
          <div className="ring">
            <svg viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
              <circle
                cx="28" cy="28" r={r}
                fill="none"
                stroke={color}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={circumference.toFixed(2)}
                strokeDashoffset={(circumference * (1 - pct / 100)).toFixed(2)}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <span className="ring-label" style={{ color }}>{pct}%</span>
          </div>
          <div>
            <div className="ring-t">{label}</div>
            <div className="ring-v" style={{ color }}>{value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
