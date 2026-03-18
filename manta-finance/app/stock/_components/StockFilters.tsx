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
    <div className="flex flex-wrap gap-2 mb-4">
      <input
        type="text"
        placeholder="Cari nama / SKU..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-48 border rounded px-2 py-1 text-sm border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <select
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-40 border rounded px-2 py-1 text-sm border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="all">Semua Kategori</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="HPP Min"
        value={hppMin}
        onChange={(e) => onHppMinChange(e.target.value)}
        className="w-32 border rounded px-2 py-1 text-sm border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <input
        type="number"
        placeholder="HPP Max"
        value={hppMax}
        onChange={(e) => onHppMaxChange(e.target.value)}
        className="w-32 border rounded px-2 py-1 text-sm border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <input
        type="number"
        placeholder="Stok Min"
        value={stockMin}
        onChange={(e) => onStockMinChange(e.target.value)}
        className="w-32 border rounded px-2 py-1 text-sm border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <input
        type="number"
        placeholder="Stok Max"
        value={stockMax}
        onChange={(e) => onStockMaxChange(e.target.value)}
        className="w-32 border rounded px-2 py-1 text-sm border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )
}
