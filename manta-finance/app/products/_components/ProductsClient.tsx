'use client'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import * as XLSX from 'xlsx'

interface ProductRow {
  id: string; sku: string; name: string; category: string
  hpp: number; hargaJual: number; baseStock: number; totalSold: number; liveStock: number
  marginUnit: number; marginPersen: number
}

const CATEGORY_MAP: Record<string, string> = {
  '001': 'Klep', '002': 'Blok Silinder', '003': 'Sensor TPS', '004': 'Retainer',
  '005': 'Shim', '006': 'Rocker Arm', '007': 'Tensioner', '008': 'Timing Gear',
}

const CATEGORIES: { code: string; label: string }[] = [
  { code: '001', label: 'Klep' },
  { code: '002', label: 'Blok Silinder' },
  { code: '003', label: 'Sensor TPS' },
  { code: '004', label: 'Retainer' },
  { code: '005', label: 'Shim' },
  { code: '006', label: 'Rocker Arm' },
  { code: '007', label: 'Tensioner' },
  { code: '008', label: 'Timing Gear' },
]

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
function fmt(n: number) { return idr.format(n) }

const emptyForm = { sku: '', name: '', category: '', hpp: '', hargaJual: '', stock: '' }

export default function ProductsClient() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Upload
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ type: string; message: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Add product form
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  // Restock modal
  const [restockId, setRestockId] = useState<string | null>(null)
  const [restockQty, setRestockQty] = useState('')
  const [restockNote, setRestockNote] = useState('')
  const [restocking, setRestocking] = useState(false)

  // ─── Fetch ────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const filtered = useMemo(() => {
    if (!search) return products
    const q = search.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  }, [products, search])

  // ─── Upload Excel ─────────────────────────────────────────────────
  async function handleUpload(file: File) {
    setUploading(true)
    setUploadResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/products/upload', { method: 'POST', body: formData })
      let data: Record<string, unknown>
      try { data = await res.json() } catch { throw new Error('Server error') }
      if (!res.ok) throw new Error((data.error as string) ?? 'Upload gagal')
      setUploadResult({
        type: 'success',
        message: `Berhasil: ${data.created} produk baru, ${data.updated} produk diupdate`,
      })
      fetchProducts()
    } catch (err) {
      setUploadResult({ type: 'error', message: String(err) })
    } finally {
      setUploading(false)
    }
  }

  // ─── Add Product ──────────────────────────────────────────────────
  function updateAddForm(field: string, value: string) {
    setAddForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setAddError('')
    try {
      const payload = {
        sku: addForm.sku.trim(),
        name: addForm.name.trim(),
        category: addForm.category,
        hpp: parseFloat(addForm.hpp) || 0,
        hargaJual: parseFloat(addForm.hargaJual) || 0,
        stock: parseInt(addForm.stock, 10) || 0,
      }
      if (!payload.sku || !payload.name) {
        setAddError('SKU dan Nama Produk wajib diisi')
        return
      }
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      let data: Record<string, unknown>
      try { data = await res.json() } catch { throw new Error('Server error') }
      if (!res.ok) throw new Error((data.error as string) ?? 'Gagal menambah produk')

      setAddForm(emptyForm)
      setShowAddForm(false)
      fetchProducts()
    } catch (err) {
      setAddError(err instanceof Error ? err.message : String(err))
    } finally {
      setAdding(false)
    }
  }

  // ─── Restock ──────────────────────────────────────────────────────
  async function handleRestock() {
    if (!restockId || !restockQty) return
    const qty = parseInt(restockQty, 10)
    if (isNaN(qty) || qty <= 0) return
    setRestocking(true)
    try {
      const res = await fetch('/api/products/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: restockId, qty, note: restockNote || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, string>).error ?? 'Gagal restock')
      }
      setRestockId(null)
      setRestockQty('')
      setRestockNote('')
      fetchProducts()
    } catch (err) {
      alert(String(err))
    } finally {
      setRestocking(false)
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────
  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus produk "${name}"? Data stok log juga akan dihapus.`)) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) fetchProducts()
  }

  // ─── Summary KPI ─────────────────────────────────────────────────
  const totalItems = filtered.length
  const totalStock = filtered.reduce((s, p) => s + p.liveStock, 0)
  const totalValue = filtered.reduce((s, p) => s + p.liveStock * p.hpp, 0)
  const lowStockCount = filtered.filter(p => p.liveStock <= 5 && p.liveStock >= 0).length

  // ─── Export Excel ──────────────────────────────────────────────
  function handleExport() {
    const data = filtered.map((p, i) => ({
      'No': i + 1,
      'SKU': p.sku,
      'Nama Produk': p.name,
      'Kategori': CATEGORY_MAP[p.category] ?? p.category,
      'HPP (Rp)': p.hpp,
      'Harga Jual (Rp)': p.hargaJual,
      'Margin (Rp)': p.marginUnit,
      'Margin (%)': Math.round(p.marginPersen * 10) / 10,
      'Stok Awal': p.baseStock,
      'Terjual': p.totalSold,
      'Stok Sisa': p.liveStock,
      'Nilai Stok (Rp)': p.liveStock * p.hpp,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    // Set column widths
    ws['!cols'] = [
      { wch: 4 }, { wch: 12 }, { wch: 35 }, { wch: 14 },
      { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 16 },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Master Produk')
    const today = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `Master-Produk-${today}.xlsx`)
  }

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="page-header anim-up d1">
        <div>
          <h1 className="page-title">Master Produk</h1>
          <p className="page-subtitle">Kelola katalog produk & stok global</p>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 anim-up d2">
        <div className="mr-card p-4">
          <p className="text-xs text-[var(--text-3)] uppercase font-semibold">Total Produk</p>
          <p className="text-xl font-bold text-[var(--text-1)] mt-1">{totalItems}</p>
        </div>
        <div className="mr-card p-4">
          <p className="text-xs text-[var(--text-3)] uppercase font-semibold">Total Stok</p>
          <p className="text-xl font-bold text-[var(--text-1)] mt-1">{totalStock.toLocaleString('id-ID')}</p>
        </div>
        <div className="mr-card p-4">
          <p className="text-xs text-[var(--text-3)] uppercase font-semibold">Nilai Inventaris</p>
          <p className="text-xl font-bold text-[var(--text-1)] mt-1">{fmt(totalValue)}</p>
        </div>
        <div className="mr-card p-4">
          <p className="text-xs text-[var(--text-3)] uppercase font-semibold">Stok Rendah</p>
          <p className="text-xl font-bold mt-1" style={{ color: lowStockCount > 0 ? 'var(--red)' : 'var(--green)' }}>{lowStockCount}</p>
        </div>
      </div>

      {/* ── Toolbar: Search + Upload + Add ──────────────────────── */}
      <div className="mr-card p-4 mb-4 anim-up d3">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Cari nama, SKU, atau kategori..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="f-input flex-1 min-w-48"
          />
          <button
            onClick={() => { setShowAddForm(f => !f); setAddError('') }}
            className="btn btn-primary disabled:opacity-50"
          >
            {showAddForm ? 'Tutup Form' : '+ Tambah Produk'}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn disabled:opacity-50"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
          >
            {uploading ? 'Mengupload...' : 'Upload Excel'}
          </button>
          <button
            onClick={handleExport}
            disabled={products.length === 0}
            className="btn disabled:opacity-50"
            style={{ background: 'var(--green-bg)', color: 'var(--green-t)', border: '1px solid var(--green)' }}
          >
            ↓ Export Excel
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = '' }}
          />
        </div>
        {uploadResult && (
          <div className={`mt-3 p-3 rounded-lg text-sm ${uploadResult.type === 'success' ? 'bg-[var(--green-bg)] text-[var(--green-t)]' : 'bg-[var(--red-bg)] text-[var(--red-t)]'}`}>
            {uploadResult.message}
          </div>
        )}
      </div>

      {/* ── Add Product Form ────────────────────────────────────── */}
      {showAddForm && (
        <div className="mr-card p-5 mb-4 anim-up" style={{ borderColor: 'var(--primary)', borderWidth: '1px' }}>
          <h3 className="text-sm font-semibold text-[var(--text-1)] mb-4">Tambah Produk Baru</h3>
          <form onSubmit={handleAddProduct}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-3)] uppercase mb-1">SKU / Kode *</label>
                <input
                  type="text"
                  value={addForm.sku}
                  onChange={e => updateAddForm('sku', e.target.value)}
                  className="f-input w-full"
                  placeholder="Contoh: 00459828"
                  required
                />
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text-3)] uppercase mb-1">Nama Produk *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={e => updateAddForm('name', e.target.value)}
                  className="f-input w-full"
                  placeholder="Contoh: Klep 31*5"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-3)] uppercase mb-1">Kategori</label>
                <select
                  value={addForm.category}
                  onChange={e => updateAddForm('category', e.target.value)}
                  className="f-input w-full"
                >
                  <option value="">-- Pilih kategori --</option>
                  {CATEGORIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} — {c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-3)] uppercase mb-1">HPP (Rp)</label>
                <input
                  type="number"
                  value={addForm.hpp}
                  onChange={e => updateAddForm('hpp', e.target.value)}
                  className="f-input w-full"
                  placeholder="Contoh: 22290"
                  min="0"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-3)] uppercase mb-1">Harga Jual (Rp)</label>
                <input
                  type="number"
                  value={addForm.hargaJual}
                  onChange={e => updateAddForm('hargaJual', e.target.value)}
                  className="f-input w-full"
                  placeholder="Contoh: 80000"
                  min="0"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-3)] uppercase mb-1">Stok Awal</label>
                <input
                  type="number"
                  value={addForm.stock}
                  onChange={e => updateAddForm('stock', e.target.value)}
                  className="f-input w-full"
                  placeholder="Contoh: 100"
                  min="0"
                />
              </div>
            </div>

            {/* Preview margin */}
            {(addForm.hpp || addForm.hargaJual) && (
              <div className="mb-4 p-3 rounded-lg bg-[var(--accent-bg)] text-sm">
                <span className="text-[var(--text-2)]">Preview Margin: </span>
                {(() => {
                  const hpp = parseFloat(addForm.hpp) || 0
                  const jual = parseFloat(addForm.hargaJual) || 0
                  const margin = jual - hpp
                  const pct = jual > 0 ? ((jual - hpp) / jual) * 100 : 0
                  return (
                    <span className={`font-semibold ${pct >= 40 ? 'text-[var(--green)]' : pct >= 20 ? 'text-[var(--orange)]' : 'text-[var(--red)]'}`}>
                      {fmt(margin)} ({pct.toFixed(1)}%)
                    </span>
                  )
                })()}
              </div>
            )}

            {addError && (
              <div className="mb-4 p-3 rounded-lg bg-[var(--red-bg)] text-[var(--red-t)] text-sm">{addError}</div>
            )}

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowAddForm(false); setAddForm(emptyForm); setAddError('') }} className="btn text-sm px-4 py-2">
                Batal
              </button>
              <button type="submit" disabled={adding} className="btn btn-primary text-sm px-4 py-2 disabled:opacity-50">
                {adding ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Restock Modal ───────────────────────────────────────── */}
      {restockId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setRestockId(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 mr-card p-6 w-full max-w-md">
            <h3 className="text-sm font-semibold text-[var(--text-1)] mb-3">
              Tambah Stok — {products.find(p => p.id === restockId)?.name}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--text-3)] mb-1">Jumlah</label>
                <input type="number" value={restockQty} onChange={e => setRestockQty(e.target.value)} className="f-input w-full" placeholder="Contoh: 50" min="1" autoFocus />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-3)] mb-1">Catatan (opsional)</label>
                <input type="text" value={restockNote} onChange={e => setRestockNote(e.target.value)} className="f-input w-full" placeholder="Contoh: Restock dari supplier X" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setRestockId(null)} className="btn text-sm px-4 py-2">Batal</button>
                <button onClick={handleRestock} disabled={restocking || !restockQty} className="btn btn-primary text-sm px-4 py-2 disabled:opacity-50">
                  {restocking ? 'Menyimpan...' : 'Tambah Stok'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Product Table ───────────────────────────────────────── */}
      <div className="mr-card overflow-hidden anim-up d4" style={{ padding: 0 }}>
        <div className="mr-table-wrap">
          <table className="mr-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th className="text-right">HPP</th>
                <th className="text-right">Harga Jual</th>
                <th className="text-right">Margin</th>
                <th className="text-center">Stok Awal</th>
                <th className="text-center">Terjual</th>
                <th className="text-center">Stok Sisa</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 10 }).map((__, j) => (
                      <td key={j}><div className="h-3 bg-[var(--border)] rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-10 text-[var(--text-3)]">
                  {products.length === 0 ? 'Belum ada produk. Tambah produk baru atau upload file Excel.' : 'Tidak ada produk yang cocok.'}
                </td></tr>
              ) : (
                filtered.map(p => {
                  const lowStock = p.liveStock <= 5
                  return (
                    <tr key={p.id}>
                      <td><span className="num text-xs" style={{ color: 'var(--text-3)' }}>{p.sku}</span></td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td className="text-[var(--text-2)]">{p.category}</td>
                      <td className="text-right"><span className="num">{fmt(p.hpp)}</span></td>
                      <td className="text-right"><span className="num">{fmt(p.hargaJual)}</span></td>
                      <td className="text-right">
                        <span className={`num ${p.marginPersen >= 40 ? 'pct-good' : p.marginPersen >= 20 ? 'pct-warn' : 'pct-bad'}`}>
                          {p.marginPersen.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center"><span className="num">{p.baseStock}</span></td>
                      <td className="text-center"><span className="num" style={{ color: 'var(--text-2)' }}>{p.totalSold}</span></td>
                      <td className="text-center">
                        <span className={`num font-semibold ${lowStock ? 'text-[var(--red)]' : ''}`}>
                          {p.liveStock}
                        </span>
                        {lowStock && p.liveStock >= 0 && (
                          <span className="ml-1 text-[10px] text-[var(--red)]">⚠</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { setRestockId(p.id); setRestockQty(''); setRestockNote('') }}
                            className="btn btn-sm btn-green"
                            title="Tambah stok"
                          >
                            + Stok
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="text-[var(--red)] text-xs hover:underline"
                            title="Hapus"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
