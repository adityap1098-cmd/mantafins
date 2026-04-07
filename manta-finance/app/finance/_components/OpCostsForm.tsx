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

function EmptyStateIllustration() {
  return (
    <div
      className="empty-state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
      }}
    >
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.4 }}
      >
        {/* Document body */}
        <rect
          x="10"
          y="8"
          width="38"
          height="48"
          rx="6"
          stroke="var(--text-3)"
          strokeWidth="2"
        />
        {/* Lines inside document */}
        <line x1="18" y1="22" x2="42" y2="22" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="30" x2="42" y2="30" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="38" x2="34" y2="38" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" />
        {/* Plus badge circle */}
        <circle cx="48" cy="48" r="10" fill="var(--bg-surface)" stroke="var(--text-3)" strokeWidth="2" />
        <line x1="48" y1="44" x2="48" y2="52" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" />
        <line x1="44" y1="48" x2="52" y2="48" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p style={{ marginTop: 14, fontSize: 14, fontWeight: 500, color: 'var(--text-3)' }}>
        Belum ada biaya operasional
      </p>
      <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-3)', opacity: 0.7 }}>
        Tambahkan biaya di form bawah
      </p>
    </div>
  )
}

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
    <div className="mr-card overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold text-[var(--text-1)]">Biaya Operasional</h2>
      </div>

      {costs.length > 0 ? (
        <div className="mr-table-wrap">
          <table className="mr-table">
            <thead>
              <tr>
                <th className="text-left">Deskripsi</th>
                <th className="text-right">Jumlah</th>
                <th className="text-center w-16">Hapus</th>
              </tr>
            </thead>
            <tbody>
              {costs.map((cost) => (
                <tr key={cost.id}>
                  <td className="text-[var(--text-2)]">{cost.description}</td>
                  <td className="text-right">
                    <span className="num" style={{ color: 'var(--text-1)' }}>{idr.format(cost.amount)}</span>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => handleDelete(cost.id)}
                      disabled={deletingId === cost.id || submitting}
                      className="btn btn-sm text-red-400 hover:text-red-600 disabled:opacity-40 bg-transparent border-0"
                    >
                      {deletingId === cost.id ? '...' : 'Hapus'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyStateIllustration />
      )}

      <div className="border-t border-[var(--border)] px-5 py-4 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Deskripsi biaya"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            disabled={submitting}
            className="f-input flex-1 disabled:opacity-60"
          />
          <input
            type="number"
            placeholder="Jumlah (IDR)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={submitting}
            min={0}
            className="f-input w-40 disabled:opacity-60"
          />
          <button
            onClick={handleAdd}
            disabled={submitting}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Menyimpan...' : 'Tambah'}
          </button>
        </div>
        {validationError && (
          <p className="text-xs text-red-500">{validationError}</p>
        )}
      </div>
    </div>
  )
}
