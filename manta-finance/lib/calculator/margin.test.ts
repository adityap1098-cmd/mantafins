import { describe, it, expect } from "vitest";
import {
  computeTransactionMetrics,
  computePeriodSummary,
  type SaleItemInput,
  type TransactionInput,
  type PeriodTransactionInput,
} from "./margin";

describe("computeTransactionMetrics", () => {
  it("computes hppTotal as sum of hppUnit * qty", () => {
    const input: TransactionInput = {
      grandTotal: 100,
      items: [
        { hppUnit: 10, hargaUnit: 20, qty: 2 },
        { hppUnit: 5, hargaUnit: 10, qty: 4 },
      ],
    };
    const result = computeTransactionMetrics(input);
    // hpp = 10*2 + 5*4 = 20 + 20 = 40
    expect(result.hppTotal).toBe(40);
  });

  it("computes diskon as SUM(harga*qty) - grandTotal", () => {
    const input: TransactionInput = {
      grandTotal: 80,
      items: [
        { hppUnit: 10, hargaUnit: 20, qty: 2 },
        { hppUnit: 5, hargaUnit: 10, qty: 4 },
      ],
    };
    const result = computeTransactionMetrics(input);
    // grossRevenue = 20*2 + 10*4 = 40 + 40 = 80
    // diskon = 80 - 80 = 0
    expect(result.diskon).toBe(0);
  });

  it("computes diskon correctly when discount is present", () => {
    const input: TransactionInput = {
      grandTotal: 70,
      items: [
        { hppUnit: 10, hargaUnit: 20, qty: 2 },
        { hppUnit: 5, hargaUnit: 10, qty: 4 },
      ],
    };
    const result = computeTransactionMetrics(input);
    // grossRevenue = 40 + 40 = 80
    // diskon = 80 - 70 = 10
    expect(result.diskon).toBe(10);
  });

  it("computes labaKotor as grandTotal - hppTotal", () => {
    const input: TransactionInput = {
      grandTotal: 100,
      items: [{ hppUnit: 40, hargaUnit: 100, qty: 1 }],
    };
    const result = computeTransactionMetrics(input);
    // labaKotor = 100 - 40 = 60
    expect(result.labaKotor).toBe(60);
  });

  it("computes marginPersen as labaKotor / grandTotal * 100", () => {
    const input: TransactionInput = {
      grandTotal: 100,
      items: [{ hppUnit: 40, hargaUnit: 100, qty: 1 }],
    };
    const result = computeTransactionMetrics(input);
    // margin = 60 / 100 * 100 = 60%
    expect(result.marginPersen).toBe(60);
  });

  it("returns marginPersen = 0 (not NaN) when grandTotal is 0", () => {
    const input: TransactionInput = {
      grandTotal: 0,
      items: [{ hppUnit: 10, hargaUnit: 10, qty: 1 }],
    };
    const result = computeTransactionMetrics(input);
    expect(result.marginPersen).toBe(0);
    expect(Number.isNaN(result.marginPersen)).toBe(false);
  });

  it("rounds values to 2 decimal places", () => {
    const input: TransactionInput = {
      grandTotal: 100,
      items: [{ hppUnit: 33.333, hargaUnit: 100, qty: 1 }],
    };
    const result = computeTransactionMetrics(input);
    expect(result.hppTotal).toBe(33.33);
  });

  it("does not mutate the input object", () => {
    const items: SaleItemInput[] = [{ hppUnit: 10, hargaUnit: 20, qty: 2 }];
    const input: TransactionInput = { grandTotal: 40, items };
    const originalItems = JSON.stringify(items);
    computeTransactionMetrics(input);
    expect(JSON.stringify(items)).toBe(originalItems);
  });
});

describe("computePeriodSummary", () => {
  const makeTransaction = (
    overrides: Partial<PeriodTransactionInput>
  ): PeriodTransactionInput => ({
    grandTotal: 100,
    paid: 100,
    balance: 0,
    status: "Terbayar",
    metrics: { hppTotal: 40, diskon: 0, labaKotor: 60, marginPersen: 60 },
    ...overrides,
  });

  it("sums totalPenjualan across all transactions", () => {
    const txs = [
      makeTransaction({ grandTotal: 100 }),
      makeTransaction({ grandTotal: 200 }),
    ];
    const result = computePeriodSummary(txs);
    expect(result.totalPenjualan).toBe(300);
  });

  it("sums totalHpp from metrics.hppTotal", () => {
    const txs = [
      makeTransaction({ metrics: { hppTotal: 40, diskon: 0, labaKotor: 60, marginPersen: 60 } }),
      makeTransaction({ metrics: { hppTotal: 80, diskon: 0, labaKotor: 120, marginPersen: 60 } }),
    ];
    const result = computePeriodSummary(txs);
    expect(result.totalHpp).toBe(120);
  });

  it("sums totalLabaKotor from metrics.labaKotor", () => {
    const txs = [
      makeTransaction({ metrics: { hppTotal: 40, diskon: 0, labaKotor: 60, marginPersen: 60 } }),
      makeTransaction({ metrics: { hppTotal: 80, diskon: 0, labaKotor: 120, marginPersen: 60 } }),
    ];
    const result = computePeriodSummary(txs);
    expect(result.totalLabaKotor).toBe(180);
  });

  it("sums totalDiskon from metrics.diskon", () => {
    const txs = [
      makeTransaction({ metrics: { hppTotal: 40, diskon: 10, labaKotor: 50, marginPersen: 50 } }),
      makeTransaction({ metrics: { hppTotal: 80, diskon: 5, labaKotor: 115, marginPersen: 57.5 } }),
    ];
    const result = computePeriodSummary(txs);
    expect(result.totalDiskon).toBe(15);
  });

  it("sums totalTerbayar from paid field", () => {
    const txs = [
      makeTransaction({ paid: 50 }),
      makeTransaction({ paid: 75 }),
    ];
    const result = computePeriodSummary(txs);
    expect(result.totalTerbayar).toBe(125);
  });

  it("includes balance in piutang only when status !== 'Terbayar'", () => {
    const txs = [
      makeTransaction({ balance: 100, status: "Belum Bayar" }),
      makeTransaction({ balance: 50, status: "Terbayar" }),
      makeTransaction({ balance: 200, status: "Cicilan" }),
    ];
    const result = computePeriodSummary(txs);
    // piutang = 100 + 200 = 300 (not the "Terbayar" one)
    expect(result.totalPiutang).toBe(300);
  });

  it("excludes 'Terbayar' transactions from piutang", () => {
    const txs = [makeTransaction({ balance: 500, status: "Terbayar" })];
    const result = computePeriodSummary(txs);
    expect(result.totalPiutang).toBe(0);
  });

  it("computes overall marginPersen as totalLabaKotor / totalPenjualan * 100", () => {
    const txs = [
      makeTransaction({ grandTotal: 200, metrics: { hppTotal: 80, diskon: 0, labaKotor: 120, marginPersen: 60 } }),
    ];
    const result = computePeriodSummary(txs);
    expect(result.marginPersen).toBe(60);
  });

  it("returns marginPersen = 0 when totalPenjualan is 0", () => {
    const result = computePeriodSummary([]);
    expect(result.marginPersen).toBe(0);
  });

  it("returns all zeros for empty transactions array", () => {
    const result = computePeriodSummary([]);
    expect(result.totalPenjualan).toBe(0);
    expect(result.totalHpp).toBe(0);
    expect(result.totalLabaKotor).toBe(0);
    expect(result.totalDiskon).toBe(0);
    expect(result.totalPiutang).toBe(0);
    expect(result.totalTerbayar).toBe(0);
  });
});
