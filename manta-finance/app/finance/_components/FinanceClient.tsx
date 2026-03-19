"use client";

import { useState, useEffect, useCallback } from "react";
import { FileSpreadsheet } from "lucide-react";
import PeriodSelector from "@/app/dashboard/_components/PeriodSelector";
import PLTable from "./PLTable";
import OpCostsForm from "./OpCostsForm";
import ProductMarginTable from "./ProductMarginTable";
import CustomerDiscountTable from "./CustomerDiscountTable";

interface FinanceSummary {
  totalPendapatan: number;
  totalHpp: number;
  labaKotor: number;
  totalDiskon: number;
  totalBiayaOperasional: number;
  labaBersih: number;
  marginKotor: number;
  marginBersih: number;
  totalPiutang: number;
  totalTerbayar: number;
  operationalCosts: { id: string; description: string; amount: number }[];
}

interface ProductMarginRow {
  productName: string;
  sku: string;
  totalQty: number;
  hppUnit: number;
  avgHargaAktual: number;
  totalLabaKotor: number;
  marginPersen: number;
}

interface CustomerDiscountRow {
  customer: string;
  totalTransaksi: number;
  totalPenjualan: number;
  totalDiskon: number;
  avgDiskonPersen: number;
}

interface FinanceData {
  summary: FinanceSummary;
  productMargins: ProductMarginRow[];
  customerDiscounts: CustomerDiscountRow[];
}

export default function FinanceClient() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFinanceData = useCallback(async (periodId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/finance?periodId=${periodId}`);
      if (!res.ok) throw new Error("Failed to fetch finance data");
      const data = (await res.json()) as FinanceData;
      setFinanceData(data);
    } catch {
      setError("Gagal memuat data finance");
      setFinanceData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedPeriodId) return;
    fetchFinanceData(selectedPeriodId);
  }, [selectedPeriodId, fetchFinanceData]);

  async function handleAddCost(description: string, amount: number) {
    if (!selectedPeriodId) return;
    const res = await fetch("/api/finance/costs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ periodId: selectedPeriodId, description, amount }),
    });
    if (!res.ok) throw new Error("Failed to add cost");
    await fetchFinanceData(selectedPeriodId);
  }

  async function handleDeleteCost(id: string) {
    const res = await fetch(`/api/finance/costs?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete cost");
    if (selectedPeriodId) {
      await fetchFinanceData(selectedPeriodId);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Finance</h1>
            <p className="text-sm text-muted-foreground">Laporan Laba Rugi</p>
          </div>
        </div>
        <PeriodSelector
          selectedPeriodId={selectedPeriodId}
          onChange={setSelectedPeriodId}
        />
      </div>

      {loading && (
        <div className="space-y-4">
          <div className="h-64 bg-secondary rounded-xl animate-pulse" />
          <div className="h-32 bg-secondary rounded-xl animate-pulse" />
          <div className="h-48 bg-secondary rounded-xl animate-pulse" />
          <div className="h-48 bg-secondary rounded-xl animate-pulse" />
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!loading && financeData && (
        <div className="space-y-6">
          <PLTable summary={financeData.summary} />
          <OpCostsForm
            costs={financeData.summary.operationalCosts}
            onAdd={handleAddCost}
            onDelete={handleDeleteCost}
          />
          <ProductMarginTable rows={financeData.productMargins} />
          <CustomerDiscountTable rows={financeData.customerDiscounts} />
        </div>
      )}
    </div>
  );
}
