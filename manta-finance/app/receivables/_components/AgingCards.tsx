'use client'

import type { CustomerReceivable } from '@/app/api/receivables/route'
import { Clock, AlertTriangle, XCircle } from 'lucide-react'

interface AgingCardsProps {
  receivables: CustomerReceivable[]
  today?: Date
}

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

export default function AgingCards({ receivables, today = new Date() }: AgingCardsProps) {
  let b0 = 0, b1 = 0, b2 = 0
  const s0 = new Set<string>()
  const s1 = new Set<string>()
  const s2 = new Set<string>()

  for (const cr of receivables) {
    for (const sale of cr.sales) {
      if (sale.balance <= 0) continue
      const days = Math.floor((today.getTime() - new Date(sale.date).getTime()) / (1000 * 60 * 60 * 24))
      if (days <= 30)      { b0 += sale.balance; s0.add(cr.customer) }
      else if (days <= 60) { b1 += sale.balance; s1.add(cr.customer) }
      else                 { b2 += sale.balance; s2.add(cr.customer) }
    }
  }

  const cards = [
    {
      testId: 'aging-card-0-30',
      label: '0 – 30 Hari',
      value: b0,
      count: s0.size,
      color: 'orange' as const,
      icon: Clock,
    },
    {
      testId: 'aging-card-31-60',
      label: '31 – 60 Hari',
      value: b1,
      count: s1.size,
      color: 'red' as const,
      icon: AlertTriangle,
    },
    {
      testId: 'aging-card-60-plus',
      label: '> 60 Hari',
      value: b2,
      count: s2.size,
      color: 'darkred' as const,
      icon: XCircle,
    },
  ]

  const COLOR_MAP = {
    orange:  { bg: 'var(--orange-bg)', icon: 'var(--orange)', value: 'var(--orange)' },
    red:     { bg: 'var(--red-bg)',    icon: 'var(--red)',    value: 'var(--red)' },
    darkred: { bg: 'rgba(127,29,29,0.12)', icon: '#7f1d1d', value: '#991b1b' },
  }

  return (
    <div className="resp-grid-3 mb-4">
      {cards.map(({ testId, label, value, count, color, icon: Icon }) => {
        const colors = COLOR_MAP[color]
        return (
          <div key={testId} data-testid={testId} className={`kpi-card ${color}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="uppercase font-semibold" style={{ fontSize: 11, letterSpacing: '0.6px', color: 'var(--text-3)' }}>
                {label}
              </span>
              <div className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 9, background: colors.bg, color: colors.icon }}>
                <Icon size={17} />
              </div>
            </div>
            <p className="num-lg" style={{ color: value > 0 ? colors.value : 'var(--text-3)' }}>
              {value > 0 ? idr.format(value) : '—'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
              {count} konsumen
            </p>
          </div>
        )
      })}
    </div>
  )
}
