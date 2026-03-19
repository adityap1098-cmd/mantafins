"use client";

import { useEffect, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

interface Period {
  id: string;
  name: string;
  month: number;
  year: number;
  createdAt: string;
}

interface PeriodSelectorProps {
  selectedPeriodId: string | null;
  onChange: (id: string) => void;
}

export default function PeriodSelector({
  selectedPeriodId,
  onChange,
}: PeriodSelectorProps) {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/periods")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch periods");
        return res.json() as Promise<{ periods: Period[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        const sorted = [...data.periods].sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year;
          return b.month - a.month;
        });
        setPeriods(sorted);
        // Auto-select first period if none selected and periods are available
        if (!selectedPeriodId && sorted.length > 0) {
          onChange(sorted[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <span className="text-sm text-destructive">Gagal memuat periode</span>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Calendar className="w-4 h-4" />
      </div>
      <select
        value={selectedPeriodId ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-card border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer min-w-[180px]"
      >
        <option value="" disabled>
          Pilih Periode
        </option>
        {periods.map((period) => (
          <option key={period.id} value={period.id}>
            {period.name}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
}
