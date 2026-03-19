"use client";

import { Fragment } from "react";
import { ChevronRight, CreditCard, History } from "lucide-react";
import type { CustomerReceivable } from "@/app/api/receivables/route";
import type { PaymentTarget } from "./ReceivablesClient";

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
  if (status === "Terbayar" || status === "LUNAS") {
    cls = "bg-success/20 text-success";
  } else if (status === "Belum Bayar" || status === "BELUM BAYAR") {
    cls = "bg-destructive/20 text-destructive";
  } else if (status === "Sebagian") {
    cls = "bg-warning/20 text-warning";
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

interface ReceivablesTableProps {
  receivables: CustomerReceivable[];
  loading: boolean;
  expandedCustomer: string | null;
  onToggleExpand: (customer: string) => void;
  onRecordPayment: (target: PaymentTarget) => void;
  onViewHistory: (customer: string) => void;
}

export default function ReceivablesTable({
  receivables,
  loading,
  expandedCustomer,
  onToggleExpand,
  onRecordPayment,
  onViewHistory,
}: ReceivablesTableProps) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border animate-pulse">
                {Array.from({ length: 7 }).map((_item, j) => (
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

  if (receivables.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-12 text-center bg-card rounded-xl border border-border">
        Tidak ada data piutang untuk periode ini
      </div>
    );
  }

  const sorted = [...receivables].sort(
    (a, b) => b.totalPiutang - a.totalPiutang
  );

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-zebra">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-8"></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Konsumen
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Transaksi
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Total Tagihan
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Terbayar
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Outstanding
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Avg Diskon
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((cr) => (
              <Fragment key={cr.customer}>
                <tr className="border-t border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleExpand(cr.customer)}
                      className="p-1 hover:bg-secondary rounded"
                    >
                      <ChevronRight
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          expandedCustomer === cr.customer ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {cr.customer}
                  </td>
                  <td className="px-4 py-3 text-center text-foreground">
                    {cr.totalTransaksi}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {formatCurrency(cr.totalTagihan)}
                  </td>
                  <td className="px-4 py-3 text-right text-success">
                    {formatCurrency(cr.totalTerbayar)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${
                      cr.totalPiutang > 0 ? "text-destructive" : "text-success"
                    }`}
                  >
                    {formatCurrency(cr.totalPiutang)}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {cr.avgDiskonPersen.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onToggleExpand(cr.customer)}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {expandedCustomer === cr.customer
                          ? "Sembunyikan"
                          : "Detail"}
                      </button>
                      <button
                        onClick={() => onViewHistory(cr.customer)}
                        className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedCustomer === cr.customer && (
                  <tr>
                    <td colSpan={8} className="px-0 py-0">
                      <div className="bg-secondary/50 border-l-4 border-primary p-4">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-muted-foreground">
                              <th className="px-3 py-2 text-left font-semibold">
                                No Ref
                              </th>
                              <th className="px-3 py-2 text-left font-semibold">
                                Tanggal
                              </th>
                              <th className="px-3 py-2 text-right font-semibold">
                                Grand Total
                              </th>
                              <th className="px-3 py-2 text-right font-semibold">
                                Terbayar
                              </th>
                              <th className="px-3 py-2 text-right font-semibold">
                                Sisa
                              </th>
                              <th className="px-3 py-2 text-left font-semibold">
                                Status
                              </th>
                              <th className="px-3 py-2 text-left font-semibold">
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {cr.sales.map((sale) => (
                              <tr
                                key={sale.id}
                                className="border-t border-border"
                              >
                                <td className="px-3 py-2 font-mono text-foreground">
                                  {sale.refNo}
                                </td>
                                <td className="px-3 py-2 text-foreground">
                                  {formatDate(sale.date)}
                                </td>
                                <td className="px-3 py-2 text-right text-foreground">
                                  {formatCurrency(sale.grandTotal)}
                                </td>
                                <td className="px-3 py-2 text-right text-success">
                                  {formatCurrency(sale.paid)}
                                </td>
                                <td
                                  className={`px-3 py-2 text-right font-semibold ${
                                    sale.balance > 0
                                      ? "text-destructive"
                                      : "text-success"
                                  }`}
                                >
                                  {formatCurrency(sale.balance)}
                                </td>
                                <td className="px-3 py-2">
                                  <StatusBadge status={sale.status} />
                                </td>
                                <td className="px-3 py-2">
                                  {sale.balance > 0 && (
                                    <button
                                      onClick={() =>
                                        onRecordPayment({
                                          saleId: sale.id,
                                          balance: sale.balance,
                                          refNo: sale.refNo,
                                        })
                                      }
                                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
                                    >
                                      <CreditCard className="w-3 h-3" />
                                      Bayar
                                    </button>
                                  )}
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
