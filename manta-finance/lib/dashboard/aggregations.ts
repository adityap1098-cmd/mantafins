export interface SaleItemData {
  sku: string;
  productName: string;
  qty: number;
  hppUnit: number;
  hargaUnit: number;
  totalHpp: number;
  totalHarga: number;
}

export interface SaleWithItems {
  customer: string;
  grandTotal: number;
  paid: number;
  balance: number;
  status: string;
  items: SaleItemData[];
}

export type ProductSnapshotMap = Map<string, string>;

export interface CustomerTotal {
  customer: string;
  total: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
}

export interface ProductQty {
  productName: string;
  qty: number;
}

export function buildSalesByCustomer(sales: SaleWithItems[]): CustomerTotal[] {
  const totals = new Map<string, number>();
  for (const sale of sales) {
    const current = totals.get(sale.customer) ?? 0;
    totals.set(sale.customer, current + sale.grandTotal);
  }
  return Array.from(totals.entries())
    .map(([customer, total]) => ({ customer, total }))
    .sort((a, b) => b.total - a.total);
}

export function buildTopProducts(
  sales: SaleWithItems[],
  limit = 10
): ProductQty[] {
  const totals = new Map<string, number>();
  for (const sale of sales) {
    for (const item of sale.items) {
      const current = totals.get(item.productName) ?? 0;
      totals.set(item.productName, current + item.qty);
    }
  }
  return Array.from(totals.entries())
    .map(([productName, qty]) => ({ productName, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
}

export function buildSalesByCategory(
  sales: SaleWithItems[],
  snapshotMap: ProductSnapshotMap
): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const sale of sales) {
    for (const item of sale.items) {
      const category = snapshotMap.get(item.sku) ?? "Unknown";
      const current = totals.get(category) ?? 0;
      totals.set(category, current + item.totalHarga);
    }
  }
  return Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}
