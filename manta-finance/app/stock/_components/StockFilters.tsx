'use client'

interface StockFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
  categories: string[]
  hppMin: string
  hppMax: string
  onHppMinChange: (value: string) => void
  onHppMaxChange: (value: string) => void
  stockMin: string
  stockMax: string
  onStockMinChange: (value: string) => void
  onStockMaxChange: (value: string) => void
}

export default function StockFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories,
  hppMin,
  hppMax,
  onHppMinChange,
  onHppMaxChange,
  stockMin,
  stockMax,
  onStockMinChange,
  onStockMaxChange,
}: StockFiltersProps) {
  return (
    <div
      className="flex flex-wrap gap-2.5 items-center mb-4 p-3.5"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        boxShadow: 'var(--sh-s)',
      }}
    >
      {/* Search with icon */}
      <div className="search-wrap">
        <input
          type="text"
          placeholder="Cari nama / SKU..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="f-input"
          style={{ width: 200 }}
        />
      </div>

      <select
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="f-input"
        style={{ width: 160 }}
      >
        <option value="all">Semua Kategori</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* HPP range */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="HPP Min"
          value={hppMin}
          onChange={(e) => onHppMinChange(e.target.value)}
          className="f-input"
          style={{ width: 100 }}
        />
        <span style={{ color: 'var(--text-3)', fontSize: 13 }}>—</span>
        <input
          type="number"
          placeholder="HPP Max"
          value={hppMax}
          onChange={(e) => onHppMaxChange(e.target.value)}
          className="f-input"
          style={{ width: 100 }}
        />
      </div>

      {/* Stock range */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Stok Min"
          value={stockMin}
          onChange={(e) => onStockMinChange(e.target.value)}
          className="f-input"
          style={{ width: 90 }}
        />
        <span style={{ color: 'var(--text-3)', fontSize: 13 }}>—</span>
        <input
          type="number"
          placeholder="Stok Max"
          value={stockMax}
          onChange={(e) => onStockMaxChange(e.target.value)}
          className="f-input"
          style={{ width: 90 }}
        />
      </div>
    </div>
  )
}
