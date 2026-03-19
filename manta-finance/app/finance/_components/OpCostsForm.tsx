"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface CostEntry {
  id: string;
  description: string;
  amount: number;
}

interface OpCostsFormProps {
  costs: CostEntry[];
  onAdd: (description: string, amount: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

export default function OpCostsForm({
  costs,
  onAdd,
  onDelete,
}: OpCostsFormProps) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleAdd() {
    const parsedAmount = parseFloat(amount);
    if (!desc.trim()) {
      setValidationError("Deskripsi tidak boleh kosong");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError("Jumlah harus lebih dari 0");
      return;
    }
    setValidationError(null);
    setSubmitting(true);
    try {
      await onAdd(desc.trim(), parsedAmount);
      setDesc("");
      setAmount("");
    } catch {
      setValidationError("Gagal menambahkan biaya. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch {
      // silently ignore — parent will not refetch on error
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 bg-secondary/50 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">
          Biaya Operasional
        </h2>
      </div>

      {costs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-zebra">
            <thead className="bg-secondary/50 text-xs text-muted-foreground uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Deskripsi</th>
                <th className="px-4 py-3 text-right font-medium">Jumlah</th>
                <th className="px-4 py-3 text-center font-medium w-16">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {costs.map((cost) => (
                <tr
                  key={cost.id}
                  className="border-t border-border hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3 text-foreground">{cost.description}</td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {idr.format(cost.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(cost.id)}
                      disabled={deletingId === cost.id || submitting}
                      className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 disabled:opacity-40 transition-colors"
                    >
                      {deletingId === cost.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-4 py-4 text-sm text-muted-foreground italic">
          Belum ada biaya operasional.
        </p>
      )}

      <div className="border-t border-border px-4 py-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            placeholder="Deskripsi biaya"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            disabled={submitting}
            className="flex-1 bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <input
            type="number"
            placeholder="Jumlah (IDR)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={submitting}
            min={0}
            className="sm:w-40 bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            onClick={handleAdd}
            disabled={submitting}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Tambah
          </button>
        </div>
        {validationError && (
          <p className="text-xs text-destructive">{validationError}</p>
        )}
      </div>
    </div>
  );
}
