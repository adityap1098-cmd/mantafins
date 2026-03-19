"use client";

import { useState, Fragment } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronRight,
} from "lucide-react";
import type { SaleRow } from "@/app/api/sales/route";

const idFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatCurrency(n: number) {
  return idFormatter.format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  let cls = "bg-warning/20 text-warning";
  if (status === "LUNAS") cls = "bg-success/20 text-success";
  else if (status === "BELUM BAYAR") cls = "bg-destructive/20 text-destructive";

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

type SortKey = "date" | "grandTotal" | "marginPersen";

interface SalesTableProps {
  rows: SaleRow[];
  loading: boolean;
  sortKey: SortKey | null;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
}

function SortArrow({
  col,
  sortKey,
  sortDir,
}: {
  col: SortKey;
  sortKey: SortKey | null;
  sortDir: "asc" | "desc";
}) {
  if (sortKey !== col)
    return <ChevronsUpDown className="w-3 h-3 opacity-50 ml-1" />;
  return sortDir === "asc" ? (
    <ChevronUp className="w-3 h-3 ml-1" />
  ) : (
    <ChevronDown className="w-3 h-3 ml-1" />
  );
}

function SortableHeader({
  col,
  label,
  sortKey,
  sortDir,
  onSort,
}: {
  col: SortKey;
  label: string;
  sortKey: SortKey | null;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
  return (
    <th
      onClick={() => onSort(col)}
      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:bg-secondary transition-colors"
    >
      <span className="inline-flex items-center">
        {label}
        <SortArrow col={col} sortKey={sortKey} sortDir={sortDir} />
      </span>
    </th>
  );
}

export default function SalesTable({
  rows,
  loading,
  sortKey,
  sortDir,
  onSort,
}: SalesTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border animate-pulse">
                {Array.from({ length: 10 }).map((__, j) => (
                  <td key={j} className="px-4 py-4">
                    <div className="h-3 bg-secondary rounded" />
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
        Tidak ada transaksi untuk periode ini.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-zebra">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-8"></th>
              <SortableHeader
                col="date"
                label="Tanggal"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={onSort}
              />
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                No Ref
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Konsumen
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Item
              </th>
              <SortableHeader
                col="grandTotal"
                label="Grand Total"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={onSort}
              />
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                HPP
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Laba Kotor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Diskon
              </th>
              <SortableHeader
                col="marginPersen"
                label="Margin %"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={onSort}
              />
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <Fragment key={row.id}>
                <tr
                  onClick={() =>
                    setExpandedId(expandedId === row.id ? null : row.id)
                  }
                  className="border-t border-border cursor-pointer hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <ChevronRight
                      className={`w-4 h-4 text-muted-foreground transition-transform ${
                        expandedId === row.id ? "rotate-90" : ""
                      }`}
                    />
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {formatDate(row.date)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {row.refNo}
                  </td>
                  <td className="px-4 py-3 text-foreground">{row.customer}</td>
                  <td className="px-4 py-3 text-center text-foreground">
                    {row.itemCount}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {formatCurrency(row.grandTotal)}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {formatCurrency(row.totalHpp)}
                  </td>
                  <td className="px-4 py-3 text-success">
                    {formatCurrency(row.labaKotor)}
                  </td>
                  <td className="px-4 py-3 text-warning">
                    {formatCurrency(row.diskon)}
                  </td>
                  <td className="px-4 py-3 text-primary font-medium">
                    {row.marginPersen.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
                {expandedId === row.id && (
                  <tr>
                    <td colSpan={11} className="px-0 py-0">
                      <div className="bg-secondary/50 border-l-4 border-primary p-4">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-muted-foreground">
                              <th className="px-3 py-2 text-left font-semibold">
                                Produk
                              </th>
                              <th className="px-3 py-2 text-left font-semibold">
                                SKU
                              </th>
                              <th className="px-3 py-2 text-right font-semibold">
                                Qty
                              </th>
                              <th className="px-3 py-2 text-right font-semibold">
                                HPP/Unit
                              </th>
                              <th className="px-3 py-2 text-right font-semibold">
                                Harga/Unit
                              </th>
                              <th className="px-3 py-2 text-right font-semibold">
                                Total HPP
                              </th>
                              <th className="px-3 py-2 text-right font-semibold">
                                Total Harga
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.items.map((item) => (
                              <tr
                                key={item.sku}
                                className="border-t border-border"
                              >
                                <td className="px-3 py-2 text-foreground">
                                  {item.productName}
                                </td>
                                <td className="px-3 py-2 font-mono text-muted-foreground">
                                  {item.sku}
                                </td>
                                <td className="px-3 py-2 text-right text-foreground">
                                  {item.qty}
                                </td>
                                <td className="px-3 py-2 text-right text-foreground">
                                  {formatCurrency(item.hppUnit)}
                                </td>
                                <td className="px-3 py-2 text-right text-foreground">
                                  {formatCurrency(item.hargaUnit)}
                                </td>
                                <td className="px-3 py-2 text-right text-foreground">
                                  {formatCurrency(item.totalHpp)}
                                </td>
                                <td className="px-3 py-2 text-right text-foreground">
                                  {formatCurrency(item.totalHarga)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
