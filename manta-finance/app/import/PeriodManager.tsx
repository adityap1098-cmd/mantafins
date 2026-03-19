"use client";

import { useState, useEffect } from "react";

interface Period {
  id: string;
  name: string;
  month: number;
  year: number;
}

interface PeriodManagerProps {
  onPeriodSelect?: (periodId: string) => void;
}

export default function PeriodManager({ onPeriodSelect }: PeriodManagerProps) {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [name, setName] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [creating, setCreating] = useState(false);
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

  function handleSelect(id: string) {
    setSelectedPeriodId(id);
    onPeriodSelect?.(id);
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Periode</h2>

      <form onSubmit={handleCreate} className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Nama periode (misal: Maret 2026)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          required
        />
        <input
          type="number"
          placeholder="Bulan (1-12)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          min={1}
          max={12}
          className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground w-32 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          required
        />
        <input
          type="number"
          placeholder="Tahun"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min={2020}
          className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground w-28 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          required
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {creating ? "Membuat..." : "Buat Periode"}
        </button>
      </form>

      {error && <p className="text-destructive text-sm mb-3">{error}</p>}

      {periods.length > 0 && (
        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            Pilih Periode Aktif:
          </label>
          <select
            value={selectedPeriodId}
            onChange={(e) => handleSelect(e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            <option value="">-- Pilih periode --</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
