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
        className="absolute inset-0 bg-black/50"
        onClick={!submitting ? onClose : undefined}
      />

      {/* Modal card */}
      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Catat Pembayaran &mdash; {target.refNo}
        </h2>

        <div className="mb-4 text-sm text-gray-600">
          Sisa Piutang:{' '}
          <span className="font-semibold text-red-600">{formatCurrency(target.balance)}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
              placeholder="Catatan pembayaran..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
