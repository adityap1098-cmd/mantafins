export interface SaleItemInput {
  hppUnit: number;
  hargaUnit: number;
  qty: number;
}

export interface TransactionInput {
  grandTotal: number;
  items: SaleItemInput[];
}

export interface TransactionMetrics {
  hppTotal: number;
  diskon: number;
  labaKotor: number;
  marginPersen: number;
}

export interface PeriodTransactionInput {
  grandTotal: number;
  paid: number;
  balance: number;
  status: string;
  metrics: TransactionMetrics;
}

export interface PeriodSummary {
  totalPenjualan: number;
  totalHpp: number;
  totalLabaKotor: number;
  totalDiskon: number;
  totalPiutang: number;
  totalTerbayar: number;
  marginPersen: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeTransactionMetrics(
  input: TransactionInput
): TransactionMetrics {
  const hppTotal = input.items.reduce(
    (sum, item) => sum + item.hppUnit * item.qty,
    0
  );
  const grossRevenue = input.items.reduce(
    (sum, item) => sum + item.hargaUnit * item.qty,
    0
  );
  const diskon = grossRevenue - input.grandTotal;
  const labaKotor = input.grandTotal - hppTotal;
  const marginPersen =
    input.grandTotal > 0 ? (labaKotor / input.grandTotal) * 100 : 0;

  return {
    hppTotal: round2(hppTotal),
    diskon: round2(diskon),
    labaKotor: round2(labaKotor),
    marginPersen: round2(marginPersen),
  };
}

export function computePeriodSummary(
  transactions: PeriodTransactionInput[]
): PeriodSummary {
  let totalPenjualan = 0;
  let totalHpp = 0;
  let totalLabaKotor = 0;
  let totalDiskon = 0;
  let totalPiutang = 0;
  let totalTerbayar = 0;

  for (const tx of transactions) {
    totalPenjualan += tx.grandTotal;
    totalHpp += tx.metrics.hppTotal;
    totalLabaKotor += tx.metrics.labaKotor;
    totalDiskon += tx.metrics.diskon;
    totalTerbayar += tx.paid;
    if (tx.status !== "Terbayar") {
      totalPiutang += tx.balance;
    }
  }

  const marginPersen =
    totalPenjualan > 0 ? (totalLabaKotor / totalPenjualan) * 100 : 0;

  return {
    totalPenjualan: round2(totalPenjualan),
    totalHpp: round2(totalHpp),
    totalLabaKotor: round2(totalLabaKotor),
    totalDiskon: round2(totalDiskon),
    totalPiutang: round2(totalPiutang),
    totalTerbayar: round2(totalTerbayar),
    marginPersen: round2(marginPersen),
  };
}
