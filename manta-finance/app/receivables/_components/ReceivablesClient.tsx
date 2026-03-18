'use client'

import { useState, useEffect } from 'react'
import PeriodSelector from '@/app/dashboard/_components/PeriodSelector'
import ReceivablesTable from './ReceivablesTable'
import PaymentModal from './PaymentModal'
import CustomerHistoryPanel from './CustomerHistoryPanel'
import type { CustomerReceivable } from '@/app/api/receivables/route'

export type PaymentTarget = {
  saleId: string
  balance: number
  refNo: string
}

const idFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function formatCurrency(n: number) {
  return idFormatter.format(n)
}

export default function ReceivablesClient() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null)
  const [receivables, setReceivables] = useState<CustomerReceivable[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null)
  const [paymentTarget, setPaymentTarget] = useState<PaymentTarget | null>(null)
  const [historyCustomer, setHistoryCustomer] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedPeriodId) return

    setLoading(true)
    fetch(`/api/receivables?periodId=${selectedPeriodId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch receivables')
        return res.json() as Promise<{ receivables: CustomerReceivable[] }>
      })
      .then((data) => {
        setReceivables(data.receivables)
      })
      .catch(() => {
        setReceivables([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [selectedPeriodId])

  async function handlePaymentSubmit(saleId: string, amount: number, note: string) {
    const res = await fetch('/api/receivables/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saleId, amount, note: note || undefined }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Gagal mencatat pembayaran' }))
      throw new Error((err as { error?: string }).error ?? 'Gagal mencatat pembayaran')
    }

    const result = await res.json() as {
      success: boolean
      saleId: string
      newPaid: number
      newBalance: number
      newStatus: string
    }

    // Optimistic update: find customer owning this sale, update sale, recompute totals
    setReceivables((prev) =>
      prev.map((cr) => {
        const saleIndex = cr.sales.findIndex((s) => s.id === saleId)
        if (saleIndex === -1) return cr

        const updatedSales = cr.sales.map((s) => {
          if (s.id !== saleId) return s
          return { ...s, paid: result.newPaid, balance: result.newBalance, status: result.newStatus }
        })

        const newTotalTerbayar = updatedSales.reduce((sum, s) => sum + s.paid, 0)
        const newTotalPiutang = updatedSales.reduce((sum, s) => sum + s.balance, 0)

        return {
          ...cr,
          sales: updatedSales,
          totalTerbayar: newTotalTerbayar,
          totalPiutang: newTotalPiutang,
        }
      })
    )

    setPaymentTarget(null)
  }

  const totalPiutang = receivables.reduce((sum, cr) => sum + cr.totalPiutang, 0)

  return (
    <div className="px-6 py-4 space-y-4">
      <div className="flex items-center gap-4">
        <PeriodSelector
          selectedPeriodId={selectedPeriodId}
          onChange={setSelectedPeriodId}
        />
      </div>

      {!loading && receivables.length > 0 && (
        <div className="bg-white rounded border border-gray-200 px-5 py-4 flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Total Piutang:</span>
          <span className="text-lg font-bold text-red-600">{formatCurrency(totalPiutang)}</span>
        </div>
      )}

      <ReceivablesTable
        receivables={receivables}
        loading={loading}
        expandedCustomer={expandedCustomer}
        onToggleExpand={(customer) =>
          setExpandedCustomer((prev) => (prev === customer ? null : customer))
        }
        onRecordPayment={setPaymentTarget}
        onViewHistory={setHistoryCustomer}
      />

      <PaymentModal
        target={paymentTarget}
        onSubmit={handlePaymentSubmit}
        onClose={() => setPaymentTarget(null)}
      />

      <CustomerHistoryPanel
        customer={historyCustomer}
        periodId={selectedPeriodId ?? ''}
        onClose={() => setHistoryCustomer(null)}
      />
    </div>
  )
}
