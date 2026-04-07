'use client'
import { useState } from 'react'
import PeriodManager from '../PeriodManager'
import UploadPanel from '../UploadPanel'
import PeriodSelector from '@/app/dashboard/_components/PeriodSelector'

export default function ImportPageClient() {
  const [selectedPeriodId, setSelectedPeriodId] = useState('')

  function handlePeriodSelect(id: string) {
    setSelectedPeriodId(id)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="page-header anim-up d1">
        <div>
          <h1 className="page-title">Import Data</h1>
          <p className="page-subtitle">Upload laporan penjualan bulanan</p>
        </div>
        <PeriodSelector
          selectedPeriodId={selectedPeriodId || null}
          onChange={setSelectedPeriodId}
        />
      </div>

      {/* Info Banner */}
      <div className="mr-card p-4 mb-6 anim-up d2" style={{ borderColor: 'var(--accent)', borderWidth: '1px' }}>
        <div className="flex items-start gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div className="text-sm text-[var(--text-2)]">
            <p className="font-semibold text-[var(--text-1)] mb-1">Cukup upload file Sales saja!</p>
            <p>Data produk diambil otomatis dari <a href="/products" className="text-[var(--accent)] underline">Master Produk</a>. Upload data produk cukup sekali di menu Master Produk.</p>
          </div>
        </div>
      </div>

      <div className="anim-up d3">
        <PeriodManager onPeriodSelect={handlePeriodSelect} />
      </div>

      {selectedPeriodId && (
        <div className="anim-up d4">
          <UploadPanel
            key={selectedPeriodId}
            periodId={selectedPeriodId}
          />
        </div>
      )}
    </div>
  )
}
