import type { PeriodSummary } from "@/lib/calculator/margin";
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Percent,
  Wallet,
  CheckCircle,
  BarChart3,
} from "lucide-react";

interface SummaryCardsProps {
  summary: PeriodSummary | null;
  loading: boolean;
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

function formatRupiah(value: number): string {
  return rupiahFormatter.format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

interface CardDef {
  label: string;
  getValue: (s: PeriodSummary) => string;
  icon: typeof DollarSign;
  colorClass: string;
}

const CARDS: CardDef[] = [
  {
    label: "Total Penjualan",
    getValue: (s) => formatRupiah(s.totalPenjualan),
    icon: DollarSign,
    colorClass: "text-primary",
  },
  {
    label: "Total HPP",
    getValue: (s) => formatRupiah(s.totalHpp),
    icon: CreditCard,
    colorClass: "text-muted-foreground",
  },
  {
    label: "Laba Kotor",
    getValue: (s) => formatRupiah(s.totalLabaKotor),
    icon: TrendingUp,
    colorClass: "text-success",
  },
  {
    label: "Total Diskon",
    getValue: (s) => formatRupiah(s.totalDiskon),
    icon: Percent,
    colorClass: "text-warning",
  },
  {
    label: "Piutang Aktif",
    getValue: (s) => formatRupiah(s.totalPiutang),
    icon: Wallet,
    colorClass: "text-destructive",
  },
  {
    label: "Sudah Terbayar",
    getValue: (s) => formatRupiah(s.totalTerbayar),
    icon: CheckCircle,
    colorClass: "text-success",
  },
  {
    label: "Margin %",
    getValue: (s) => formatPercent(s.marginPersen),
    icon: BarChart3,
    colorClass: "text-accent",
  },
];

const ZERO_SUMMARY: PeriodSummary = {
  totalPenjualan: 0,
  totalHpp: 0,
  totalLabaKotor: 0,
  totalDiskon: 0,
  totalPiutang: 0,
  totalTerbayar: 0,
  marginPersen: 0,
};

export default function SummaryCards({ summary, loading }: SummaryCardsProps) {
  const data = summary ?? ZERO_SUMMARY;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-lg bg-secondary ${card.colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">
                {card.label}
              </p>
            </div>
            {loading ? (
              <div className="animate-pulse bg-secondary rounded h-7" />
            ) : (
              <p className={`text-lg font-bold ${card.colorClass}`}>
                {card.getValue(data)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
