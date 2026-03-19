"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface ProductMarginRow {
  productName: string;
  sku: string;
  totalQty: number;
  hppUnit: number;
  avgHargaAktual: number;
  totalLabaKotor: number;
  marginPersen: number;
}

interface ProductMarginTableProps {
  rows: ProductMarginRow[];
}

type SortKey = keyof ProductMarginRow;

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

function marginColor(pct: number): string {
  if (pct >= 30) return "text-success font-medium";
  if (pct >= 15) return "text-warning font-medium";
  return "text-destructive font-medium";
}

interface ThProps {
  label: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}

function SortableTh({
  label,
  sortKey,
  currentSortKey,
  sortDir,
  onSort,
  align = "left",
}: ThProps) {
  const isActive = currentSortKey === sortKey;
  return (
    <th
      className={`px-4 py-3 font-medium cursor-pointer select-none hover:bg-secondary transition-colors ${align === "right" ? "text-right" : "text-left"}`}
      onClick={() => onSort(sortKey)}
    >
      <span
        className="inline-flex items-center gap-1"
        style={
          align === "right"
            ? { justifyContent: "flex-end" }
            : { justifyContent: "flex-start" }
        }
      >
        {label}
        {isActive ? (
          sortDir === "asc" ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )
        ) : (
          <ChevronsUpDown className="w-3 h-3 opacity-50" />
        )}
      </span>
    </th>
  );
}

export default function ProductMarginTable({ rows }: ProductMarginTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("marginPersen");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 bg-secondary/50 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">
          Margin per Produk
        </h2>
      </div>

      {sorted.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground text-center">
          Tidak ada data produk untuk periode ini
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-zebra">
            <thead className="bg-secondary/50 text-xs text-muted-foreground uppercase tracking-wide">
              <tr>
                <SortableTh
                  label="Nama Produk"
                  sortKey="productName"
                  currentSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <SortableTh
                  label="SKU"
                  sortKey="sku"
                  currentSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Total Qty"
                  sortKey="totalQty"
                  currentSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  align="right"
                />
                <SortableTh
                  label="HPP/Unit"
                  sortKey="hppUnit"
                  currentSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  align="right"
                />
                <SortableTh
                  label="Avg Harga Aktual"
                  sortKey="avgHargaAktual"
                  currentSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  align="right"
                />
                <SortableTh
                  label="Laba Kotor"
                  sortKey="totalLabaKotor"
                  currentSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  align="right"
                />
                <SortableTh
                  label="Margin %"
                  sortKey="marginPersen"
                  currentSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  align="right"
                />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.sku}
                  className="border-t border-border hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3 text-foreground font-medium">
                    {row.productName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {row.sku}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {row.totalQty.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {idr.format(row.hppUnit)}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {idr.format(row.avgHargaAktual)}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {idr.format(row.totalLabaKotor)}
                  </td>
                  <td className={`px-4 py-3 text-right ${marginColor(row.marginPersen)}`}>
                    {row.marginPersen.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
