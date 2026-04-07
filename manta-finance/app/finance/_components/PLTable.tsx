'use client'

interface FinanceSummary {
  totalPendapatan: number
  totalHpp: number
  labaKotor: number
  totalDiskon: number
  totalBiayaOperasional: number
  labaBersih: number
  marginKotor: number
  marginBersih: number
  totalPiutang: number
  totalTerbayar: number
  operationalCosts: { id: string; description: string; amount: number }[]
}

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
const fmt = (v: number) => idr.format(v)
const pct = (v: number) => `${v.toFixed(1)}%`

export default function PLTable({ summary }: { summary: FinanceSummary }) {
  const isLabaBersihPositive = summary.labaBersih >= 0
  const isLabaKotorPositive = summary.labaKotor >= 0
  const piutangOutstanding = summary.totalPiutang - summary.totalTerbayar

  return (
    <div className="mr-card" style={{ padding: 22 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px', color: 'var(--text-1)', marginBottom: 16 }}>Laporan Laba Rugi</h2>

      {/* Pendapatan section */}
      <div className="pl-section accent">
        <div className="pl-head">
          <span>Pendapatan Kotor</span>
          <span className="num" style={{ color: 'var(--accent)' }}>{fmt(summary.totalPendapatan)}</span>
        </div>
        <div className="pl-row">
          <span>Harga Pokok Penjualan (HPP)</span>
          <span className="num" style={{ color: 'var(--red)' }}>({fmt(summary.totalHpp)})</span>
        </div>
      </div>

      {/* Laba Kotor section */}
      <div className="pl-section green">
        <div className="pl-head">
          <span>Laba Kotor</span>
          <span className="num" style={{ fontSize: 18, fontWeight: 700, color: isLabaKotorPositive ? 'var(--green)' : 'var(--red)' }}>
            {fmt(summary.labaKotor)}
          </span>
        </div>
        <div className="pl-row">
          <span>Margin Kotor</span>
          <span className="num" style={{ color: 'var(--green)' }}>{pct(summary.marginKotor)}</span>
        </div>
        <div className="pl-row">
          <span>Total Diskon</span>
          <span className="num" style={{ color: 'var(--red)' }}>({fmt(summary.totalDiskon)})</span>
        </div>
        <div className="pl-row">
          <span>Biaya Operasional</span>
          <span className="num" style={{ color: 'var(--text-3)' }}>({fmt(summary.totalBiayaOperasional)})</span>
        </div>
        {summary.operationalCosts.map((cost) => (
          <div key={cost.id} className="pl-row sub">
            <span style={{ color: 'var(--text-3)' }}>{cost.description}</span>
            <span className="num" style={{ color: 'var(--text-2)' }}>({fmt(cost.amount)})</span>
          </div>
        ))}
      </div>

      {/* Laba Bersih section */}
      <div className={`pl-section ${isLabaBersihPositive ? 'green' : 'red'}`}>
        <div className="pl-head">
          <span>Laba Bersih</span>
          <span className="num" style={{ fontSize: 18, fontWeight: 700, color: isLabaBersihPositive ? 'var(--green)' : 'var(--red)' }}>
            {fmt(summary.labaBersih)}
          </span>
        </div>
        <div className="pl-row">
          <span>Margin Bersih</span>
          <span className="num" style={{ color: isLabaBersihPositive ? 'var(--green)' : 'var(--red)' }}>{pct(summary.marginBersih)}</span>
        </div>
      </div>

      {/* Piutang info */}
      <div
        className="flex justify-between px-4 py-3"
        style={{ background: 'var(--bg-surface-hover)', borderRadius: 10, marginTop: 12 }}
      >
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Total Piutang</p>
          <p className="num" style={{ fontWeight: 600, marginTop: 2, color: 'var(--red)' }}>{fmt(summary.totalPiutang)}</p>
        </div>
        <div className="text-right">
          <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Sudah Terbayar</p>
          <p className="num" style={{ fontWeight: 600, marginTop: 2, color: 'var(--green)' }}>{fmt(summary.totalTerbayar)}</p>
        </div>
      </div>

      {/* Piutang outstanding */}
      <div
        className="flex justify-between px-4 py-2"
        style={{ marginTop: 4 }}
      >
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Piutang Outstanding</span>
        <span className="num" style={{ fontSize: 12, fontWeight: 600, color: piutangOutstanding > 0 ? 'var(--orange)' : 'var(--green)' }}>
          {fmt(piutangOutstanding)}
        </span>
      </div>
    </div>
  )
}
