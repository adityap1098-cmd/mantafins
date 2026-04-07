"use client";
import { useState, useEffect } from "react";
import MonthSelect from "@/app/_components/MonthSelect";

interface Period {
  id: string;
  name: string;
  month: number;
  year: number;
}

interface PeriodManagerProps {
  onPeriodSelect?: (periodId: string) => void;
}

const MONTH_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function PeriodManager({ onPeriodSelect }: PeriodManagerProps) {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [name, setName] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPeriods();
  }, []);

  async function fetchPeriods() {
    const res = await fetch("/api/periods");
    if (res.ok) {
      const data = await res.json();
      setPeriods(data.periods);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !month || !year) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, month: Number(month), year: Number(year) }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create period");
        return;
      }
      const data = await res.json();
      setPeriods((prev) => [data.period, ...prev]);
      setSelectedPeriodId(data.period.id);
      onPeriodSelect?.(data.period.id);
      setName("");
      setMonth("");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(periodId: string, periodName: string) {
    if (!confirm(`Hapus periode "${periodName}" beserta semua data (produk, penjualan, pembayaran)?`)) {
      return;
    }
    setDeleting(periodId);
    setError("");
    try {
      const res = await fetch(`/api/periods?id=${periodId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        let msg = "Gagal menghapus periode";
        try {
          const data = await res.json();
          msg = data.error ?? msg;
        } catch {}
        setError(msg);
        return;
      }
      setPeriods((prev) => prev.filter((p) => p.id !== periodId));
      if (selectedPeriodId === periodId) {
        setSelectedPeriodId("");
        onPeriodSelect?.("");
      }
    } finally {
      setDeleting("");
    }
  }

  function handleSelect(id: string) {
    setSelectedPeriodId(id);
    onPeriodSelect?.(id);
  }

  return (
    <div className="mr-card p-6 mb-6">
      <h2 className="text-sm font-semibold text-[var(--text-1)] mb-4">Periode</h2>

      <form onSubmit={handleCreate} className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Nama periode (misal: Maret 2026)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="f-input flex-1 min-w-48"
          required
        />
        <MonthSelect
          value={month}
          onChange={setMonth}
          className="f-input"
          required
        />
        <input
          type="number"
          placeholder="Tahun"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min={2020}
          className="f-input w-28"
          required
        />
        <button
          type="submit"
          disabled={creating}
          className="btn btn-primary disabled:opacity-50"
        >
          {creating ? "Membuat..." : "Buat Periode"}
        </button>
      </form>

      {error && <p className="text-[var(--red)] text-sm mb-3">{error}</p>}

      {periods.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-[var(--text-3)] uppercase tracking-wide mb-2">
            Daftar Periode
          </label>
          <div className="space-y-2 mb-4">
            {periods.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                  selectedPeriodId === p.id
                    ? "border-[var(--primary)] bg-[var(--primary-bg)]"
                    : "border-[var(--border)] hover:border-[var(--text-3)]"
                }`}
                onClick={() => handleSelect(p.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      selectedPeriodId === p.id ? "bg-[var(--primary)]" : "bg-[var(--text-3)]"
                    }`}
                  />
                  <span className="text-sm font-medium text-[var(--text-1)] truncate">
                    {p.name}
                  </span>
                  <span className="text-xs text-[var(--text-3)] flex-shrink-0">
                    {MONTH_NAMES[p.month]} {p.year}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(p.id, p.name);
                  }}
                  disabled={deleting === p.id}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md transition-colors flex-shrink-0 hover:bg-[var(--red-bg)]"
                  style={{ color: "var(--red)" }}
                  title={`Hapus ${p.name}`}
                >
                  {deleting === p.id ? (
                    "Menghapus..."
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Hapus
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
