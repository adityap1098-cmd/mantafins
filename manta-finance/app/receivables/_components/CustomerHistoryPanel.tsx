"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
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

interface CustomerHistoryPanelProps {
  customer: string | null;
  periodId: string;
  onClose: () => void;
}

export default function CustomerHistoryPanel({
  customer,
  periodId,
  onClose,
}: CustomerHistoryPanelProps) {
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer || !periodId) return;

    setLoading(true);
    setError("");
    setSales([]);

    fetch(
      `/api/receivables/customer?customer=${encodeURIComponent(customer)}&periodId=${encodeURIComponent(periodId)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat riwayat");
        return res.json() as Promise<{ sales: SaleRow[] }>;
      })
      .then((data) => {
        setSales(data.sales);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Gagal memuat riwayat");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [customer, periodId]);

  if (!customer) return null;

  const totalGrandTotal = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalLabaKotor = sales.reduce((sum, s) => sum + s.labaKotor, 0);
  const avgMargin =
    sales.length > 0
      ? sales.reduce((sum, s) => sum + s.marginPersen, 0) / sales.length
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel card */}
      <div className="relative z-10 bg-card rounded-xl border border-border shadow-2xl w-full max-w-4xl mx-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Riwayat Pembelian
            </h2>
            <p className="text-sm text-muted-foreground">{customer}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-12">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memuat data...
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive py-4 text-center">
              {error}
            </div>
          )}

          {!loading && !error && sales.length === 0 && (
            <div className="text-sm text-muted-foreground py-12 text-center">
              Tidak ada transaksi untuk konsumen ini
            </div>
          )}

          {!loading && !error && sales.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-zebra">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      No Ref
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Grand Total
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      HPP Total
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Laba Kotor
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Margin %
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-t border-border hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-foreground">
                        {formatDate(sale.date)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {sale.refNo}
                      </td>
                      <td className="px-4 py-3 text-right text-foreground">
                        {formatCurrency(sale.grandTotal)}
                      </td>
                      <td className="px-4 py-3 text-right text-foreground">
                        {formatCurrency(sale.totalHpp)}
                      </td>
                      <td className="px-4 py-3 text-right text-success">
                        {formatCurrency(sale.labaKotor)}
                      </td>
                      <td className="px-4 py-3 text-right text-primary font-medium">
                        {sale.marginPersen.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* Summary row */}
                  <tr className="border-t-2 border-border bg-secondary/50 font-semibold">
                    <td
                      className="px-4 py-3 text-xs text-muted-foreground"
                      colSpan={2}
                    >
                      Total ({sales.length} transaksi)
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-foreground">
                      {formatCurrency(totalGrandTotal)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs"></td>
                    <td className="px-4 py-3 text-right text-xs text-success">
                      {formatCurrency(totalLabaKotor)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-primary">
                      {avgMargin.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
