"use client";

import { Users, Filter, Calendar, ChevronDown } from "lucide-react";

interface SalesFiltersProps {
  customerFilter: string;
  onCustomerChange: (value: string) => void;
  customers: string[];
  statusFilter: string;
  onStatusChange: (value: string) => void;
  statuses: string[];
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
}

export default function SalesFilters({
  customerFilter,
  onCustomerChange,
  customers,
  statusFilter,
  onStatusChange,
  statuses,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: SalesFiltersProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Customer filter */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Users className="w-4 h-4" />
          </div>
          <select
            value={customerFilter}
            onChange={(e) => onCustomerChange(e.target.value)}
            className="appearance-none bg-input border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer min-w-[160px]"
          >
            <option value="all">Semua Konsumen</option>
            {customers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Status filter */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none bg-input border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer min-w-[140px]"
          >
            <option value="all">Semua Status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="bg-input border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Dari"
            />
          </div>
          <span className="text-muted-foreground text-sm">-</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Sampai"
          />
        </div>
      </div>
    </div>
  );
}
