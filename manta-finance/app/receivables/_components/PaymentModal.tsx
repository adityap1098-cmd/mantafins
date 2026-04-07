'use client'

import { useState, useEffect } from 'react'
import type { PaymentTarget } from './ReceivablesClient'

const idFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function formatCurrency(n: number) {
  return idFormatter.format(n)
}

interface PaymentModalProps {
  target: PaymentTarget | null
  onSubmit: (saleId: string, amount: number, note: string) => Promise<void>
  onClose: () => void
}

export default function PaymentModal({ target, onSubmit, onClose }: PaymentModalProps) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Reset form when target changes
  useEffect(() => {
    setAmount('')
    setNote('')
    setError('')
    setSubmitting(false)
  }, [target])

  if (!target) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!target) return

    const parsedAmount = parseFloat(amount)

    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > target.balance) {
      setError('Jumlah tidak valid')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      await onSubmit(target.saleId, parsedAmount, note)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mencatat pembayaran')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!submitting ? onClose : undefined}
      />

      {/* Modal card */}
      <div className="relative z-10 mr-card w-full max-w-md mx-4 p-6">
        <h2 className="text-base font-semibold text-[var(--text-1)] mb-4">
          Catat Pembayaran &mdash; <span className="font-mono text-[var(--accent)]">{target.refNo}</span>
        </h2>

        <div className="mb-4 text-sm text-[var(--text-2)]">
          Sisa Piutang:{' '}
          <span className="font-semibold text-[var(--red)]">{formatCurrency(target.balance)}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-3)] uppercase tracking-wide mb-1.5">
              Jumlah Bayar
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
              max={target.balance}
              step={1}
              disabled={submitting}
              placeholder="0"
              className="f-input w-full disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-3)] uppercase tracking-wide mb-1.5">
              Keterangan <span className="text-[var(--text-3)] font-normal normal-case">(opsional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
              placeholder="Catatan pembayaran..."
              className="f-input w-full disabled:opacity-60"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--red)] bg-[var(--red-bg)] rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-secondary disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
