"use client";

import { useRef, useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Check } from "lucide-react";
import type { StockRow } from "@/app/api/stock/route";

interface StockTableProps {
  rows: StockRow[];
  loading: boolean;
  sortKey: keyof StockRow | null;
  sortDir: "asc" | "desc";
  onSort: (key: keyof StockRow) => void;
  onStockEdit: (sku: string, newStock: number) => void;
}

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

interface Column {
  key: keyof StockRow;
  label: string;
}

const COLUMNS: Column[] = [
  { key: "sku", label: "SKU" },
  { key: "name", label: "Nama Produk" },
  { key: "category", label: "Kategori" },
  { key: "hpp", label: "HPP" },
  { key: "hargaJual", label: "Harga Jual" },
  { key: "stock", label: "Stok" },
  { key: "marginUnit", label: "Margin/Unit" },
  { key: "marginPersen", label: "Margin %" },
];

function SortArrow({
  colKey,
  sortKey,
  sortDir,
}: {
  colKey: keyof StockRow;
  sortKey: keyof StockRow | null;
  sortDir: "asc" | "desc";
}) {
  if (sortKey !== colKey)
    return <ChevronsUpDown className="w-3 h-3 opacity-50 ml-1" />;
  return sortDir === "asc" ? (
    <ChevronUp className="w-3 h-3 ml-1 text-primary" />
  ) : (
    <ChevronDown className="w-3 h-3 ml-1 text-primary" />
  );
}

function stockColorClass(stock: number): string {
  if (stock < 10) return "bg-destructive/10";
  if (stock < 50) return "bg-warning/10";
  return "";
}

interface StockCellProps {
  row: StockRow;
  onStockEdit: (sku: string, newStock: number) => void;
}

function StockCell({ row, onStockEdit }: StockCellProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    if (!inputRef.current) return;
    const val = inputRef.current.value.trim();
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed !== row.stock) {
      onStockEdit(row.sku, parsed);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="number"
          min="0"
          defaultValue={row.stock}
          autoFocus
          className="w-20 bg-input border border-ring rounded px-2 py-1 text-sm text-foreground focus:outline-none"
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
        />
        <button
          onClick={commit}
          className="p-1 rounded bg-success/20 text-success hover:bg-success/30 transition-colors"
        >
          <Check className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <span
      className="cursor-pointer underline decoration-dotted decoration-muted-foreground hover:text-primary transition-colors"
      title="Klik untuk edit"
      onClick={() => setEditing(true)}
    >
      {row.stock}
    </span>
  );
}

export default function StockTable({
  rows,
  loading,
  sortKey,
  sortDir,
  onSort,
  onStockEdit,
}: StockTableProps) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="animate-pulse border-t border-border">
                {COLUMNS.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-secondary rounded w-16" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-12 text-center bg-card rounded-xl border border-border">
        Tidak ada data stock untuk periode ini.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-zebra">
          <thead className="bg-secondary/50">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => onSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:bg-secondary transition-colors"
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    <SortArrow
                      colKey={col.key}
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.sku}
                className={`border-t border-border hover:bg-secondary/30 transition-colors ${stockColorClass(row.stock)}`}
              >
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {row.sku}
                </td>
                <td className="px-4 py-3 text-foreground font-medium">
                  {row.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.category}
                </td>
                <td className="px-4 py-3 text-foreground tabular-nums">
                  {idr.format(row.hpp)}
                </td>
                <td className="px-4 py-3 text-foreground tabular-nums">
                  {idr.format(row.hargaJual)}
                </td>
                <td className="px-4 py-3">
                  <StockCell row={row} onStockEdit={onStockEdit} />
                </td>
                <td className="px-4 py-3 text-success tabular-nums">
                  {idr.format(row.marginUnit)}
                </td>
                <td className="px-4 py-3 text-primary tabular-nums font-medium">
                  {row.marginPersen.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
