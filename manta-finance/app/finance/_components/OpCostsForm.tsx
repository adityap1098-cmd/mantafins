'use client'

import { useState } from 'react'

interface CostEntry {
  id: string
  description: string
  amount: number
}

interface OpCostsFormProps {
  costs: CostEntry[]
  onAdd: (description: string, amount: number) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
})

export default function OpCostsForm({ costs, onAdd, onDelete }: OpCostsFormProps) {
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleAdd() {
    const parsedAmount = parseFloat(amount)
    if (!desc.trim()) {
      setValidationError('Deskripsi tidak boleh kosong')
      return
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError('Jumlah harus lebih dari 0')
      return
    }
    setValidationError(null)
    setSubmitting(true)
    try {
      await onAdd(desc.trim(), parsedAmount)
      setDesc('')
      setAmount('')
    } catch {
      setValidationError('Gagal menambahkan biaya. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await onDelete(id)
    } catch {
      // silently ignore — parent will not refetch on error
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-800">Biaya Operasional</h2>
      </div>

      {costs.length > 0 ? (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Deskripsi</th>
              <th className="px-4 py-2 text-right font-medium">Jumlah</th>
              <th className="px-4 py-2 text-center font-medium w-16">Hapus</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((cost) => (
              <tr key={cost.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700">{cost.description}</td>
                <td className="px-4 py-2 text-right text-gray-800">{idr.format(cost.amount)}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleDelete(cost.id)}
                    disabled={deletingId === cost.id || submitting}
                    className="text-red-500 hover:text-red-700 disabled:opacity-40 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    {deletingId === cost.id ? '...' : 'Hapus'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="px-4 py-3 text-sm text-gray-400 italic">Belum ada biaya operasional.</p>
      )}

      <div className="border-t border-gray-100 px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Deskripsi biaya"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            disabled={submitting}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <input
            type="number"
            placeholder="Jumlah (IDR)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={submitting}
            min={0}
            className="w-40 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            onClick={handleAdd}
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Menyimpan...' : 'Tambah'}
          </button>
        </div>
        {validationError && (
          <p className="text-xs text-red-600">{validationError}</p>
        )}
      </div>
    </div>
  )
}
