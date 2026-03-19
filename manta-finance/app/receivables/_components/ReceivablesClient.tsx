"use client";

import { useState, useEffect } from "react";
import { Wallet, Users, AlertCircle } from "lucide-react";
import PeriodSelector from "@/app/dashboard/_components/PeriodSelector";
import ReceivablesTable from "./ReceivablesTable";
import PaymentModal from "./PaymentModal";
import CustomerHistoryPanel from "./CustomerHistoryPanel";
import type { CustomerReceivable } from "@/app/api/receivables/route";

export type PaymentTarget = {
  saleId: string;
  balance: number;
  refNo: string;
};

const idFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatCurrency(n: number) {
  return idFormatter.format(n);
}

export default function ReceivablesClient() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [receivables, setReceivables] = useState<CustomerReceivable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<PaymentTarget | null>(
    null
  );
  const [historyCustomer, setHistoryCustomer] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPeriodId) return;

    setLoading(true);
    setError(null);
    fetch(`/api/receivables?periodId=${selectedPeriodId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json() as Promise<{ receivables: CustomerReceivable[] }>;
      })
      .then((data) => {
        setReceivables(data.receivables);
      })
      .catch((err: unknown) => {
        setReceivables([]);
        setError(
          err instanceof Error ? err.message : "Gagal memuat data piutang"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedPeriodId]);

  async function handlePaymentSubmit(
    saleId: string,
    amount: number,
    note: string
  ) {
    const res = await fetch("/api/receivables/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ saleId, amount, note: note || undefined }),
    });

    if (!res.ok) {
      const err = await res
        .json()
        .catch(() => ({ error: "Gagal mencatat pembayaran" }));
      throw new Error(
        (err as { error?: string }).error ?? "Gagal mencatat pembayaran"
      );
    }

    const result = (await res.json()) as {
      success: boolean;
      saleId: string;
      newPaid: number;
      newBalance: number;
      newStatus: string;
    };

    // Optimistic update
    setReceivables((prev) =>
      prev.map((cr) => {
        const saleIndex = cr.sales.findIndex((s) => s.id === saleId);
        if (saleIndex === -1) return cr;

        const updatedSales = cr.sales.map((s) => {
          if (s.id !== saleId) return s;
          return {
            ...s,
            paid: result.newPaid,
            balance: result.newBalance,
            status: result.newStatus,
          };
        });

        const newTotalTerbayar = updatedSales.reduce(
          (sum, s) => sum + s.paid,
          0
        );
        const newTotalPiutang = updatedSales.reduce(
          (sum, s) => sum + s.balance,
          0
        );

        return {
          ...cr,
          sales: updatedSales,
          totalTerbayar: newTotalTerbayar,
          totalPiutang: newTotalPiutang,
        };
      })
    );

    setPaymentTarget(null);
  }

  const totalPiutang = receivables.reduce((sum, cr) => sum + cr.totalPiutang, 0);
  const totalCustomers = receivables.filter((cr) => cr.totalPiutang > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Piutang</h1>
            <p className="text-sm text-muted-foreground">
              Accounts Receivable
            </p>
          </div>
        </div>
        <PeriodSelector
          selectedPeriodId={selectedPeriodId}
          onChange={setSelectedPeriodId}
        />
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && receivables.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Total Piutang
              </span>
            </div>
            <span className="text-2xl font-bold text-destructive">
              {formatCurrency(totalPiutang)}
            </span>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-warning" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Konsumen dengan Hutang
              </span>
            </div>
            <span className="text-2xl font-bold text-warning">
              {totalCustomers}
            </span>
          </div>
        </div>
      )}

      <ReceivablesTable
        receivables={receivables}
        loading={loading}
        expandedCustomer={expandedCustomer}
        onToggleExpand={(customer) =>
          setExpandedCustomer((prev) => (prev === customer ? null : customer))
        }
        onRecordPayment={setPaymentTarget}
        onViewHistory={setHistoryCustomer}
      />

      <PaymentModal
        target={paymentTarget}
        onSubmit={handlePaymentSubmit}
        onClose={() => setPaymentTarget(null)}
      />

      <CustomerHistoryPanel
        customer={historyCustomer}
        periodId={selectedPeriodId ?? ""}
        onClose={() => setHistoryCustomer(null)}
      />
    </div>
  );
}
