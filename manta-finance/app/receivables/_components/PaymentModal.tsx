"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import type { PaymentTarget } from "./ReceivablesClient";

const idFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatCurrency(n: number) {
  return idFormatter.format(n);
}

interface PaymentModalProps {
  target: PaymentTarget | null;
  onSubmit: (saleId: string, amount: number, note: string) => Promise<void>;
  onClose: () => void;
}

export default function PaymentModal({
  target,
  onSubmit,
  onClose,
}: PaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAmount("");
    setNote("");
    setError("");
    setSubmitting(false);
  }, [target]);

  if (!target) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return;

    const parsedAmount = parseFloat(amount);

    if (
      isNaN(parsedAmount) ||
      parsedAmount <= 0 ||
      parsedAmount > target.balance
    ) {
      setError("Jumlah tidak valid");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await onSubmit(target.saleId, parsedAmount, note);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mencatat pembayaran");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!submitting ? onClose : undefined}
      />

      {/* Modal card */}
      <div className="relative z-10 bg-card rounded-xl border border-border shadow-2xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Catat Pembayaran
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ref Number */}
        <div className="bg-secondary/50 rounded-lg px-4 py-3 mb-6">
          <p className="text-xs text-muted-foreground mb-1">No. Referensi</p>
          <p className="font-mono text-sm text-foreground">{target.refNo}</p>
        </div>

        {/* Balance Info */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-1">Sisa Piutang</p>
          <p className="text-2xl font-bold text-destructive">
            {formatCurrency(target.balance)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Jumlah Bayar
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
              max={target.balance}
              step={1}
              disabled={submitting}
              placeholder="0"
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Keterangan{" "}
              <span className="text-muted-foreground font-normal">
                (opsional)
              </span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
              placeholder="Catatan pembayaran..."
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-sm rounded-lg border border-border text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Menyimpan..." : "Simpan Pembayaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
