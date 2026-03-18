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
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Periode</h2>

      <form onSubmit={handleCreate} className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Nama periode (misal: Maret 2026)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 min-w-48"
          required
        />
        <input
          type="number"
          placeholder="Bulan (1-12)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          min={1}
          max={12}
          className="border border-gray-300 rounded px-3 py-2 text-sm w-32"
          required
        />
        <input
          type="number"
          placeholder="Tahun"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min={2020}
          className="border border-gray-300 rounded px-3 py-2 text-sm w-28"
          required
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {creating ? "Membuat..." : "Buat Periode"}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {periods.length > 0 && (
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Pilih Periode Aktif:
          </label>
          <select
            value={selectedPeriodId}
            onChange={(e) => handleSelect(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full max-w-sm"
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
