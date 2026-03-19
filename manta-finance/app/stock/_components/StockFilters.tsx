"use client";

import { Search, Filter, ChevronDown } from "lucide-react";

interface StockFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  hppMin: string;
  hppMax: string;
  onHppMinChange: (value: string) => void;
  onHppMaxChange: (value: string) => void;
  stockMin: string;
  stockMax: string;
  onStockMinChange: (value: string) => void;
  onStockMaxChange: (value: string) => void;
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
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Cari nama / SKU..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-input border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-48"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="appearance-none bg-input border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer min-w-[160px]"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* HPP range */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">HPP:</span>
          <input
            type="number"
            placeholder="Min"
            value={hppMin}
            onChange={(e) => onHppMinChange(e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-24"
          />
          <span className="text-muted-foreground">-</span>
          <input
            type="number"
            placeholder="Max"
            value={hppMax}
            onChange={(e) => onHppMaxChange(e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-24"
          />
        </div>

        {/* Stock range */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Stok:</span>
          <input
            type="number"
            placeholder="Min"
            value={stockMin}
            onChange={(e) => onStockMinChange(e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-24"
          />
          <span className="text-muted-foreground">-</span>
          <input
            type="number"
            placeholder="Max"
            value={stockMax}
            onChange={(e) => onStockMaxChange(e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-24"
          />
        </div>
      </div>
    </div>
  );
}
