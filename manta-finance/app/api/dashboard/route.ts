import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import {
  computeTransactionMetrics,
  computePeriodSummary,
  type PeriodSummary,
} from "@/lib/calculator/margin";
import {
  buildSalesByCustomer,
  buildTopProducts,
  buildSalesByCategory,
  type CustomerTotal,
  type CategoryTotal,
  type ProductQty,
  type SaleWithItems,
} from "@/lib/dashboard/aggregations";

export interface DashboardData {
  summary: PeriodSummary;
  salesByCustomer: CustomerTotal[];
  salesByCategory: CategoryTotal[];
  topProducts: ProductQty[];
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const valid = await validateSession(token);
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const periodId = req.nextUrl.searchParams.get("periodId");
  if (!periodId) {
    return NextResponse.json({ error: "periodId required" }, { status: 400 });
  }

  const sales = await prisma.sale.findMany({
    where: { periodId },
    include: { items: true },
  });

  const snapshots = await prisma.productSnapshot.findMany({
    where: { periodId },
  });
  const snapshotMap = new Map(
    snapshots.map((s) => [s.sku, s.category] as [string, string])
  );

  const salesWithItems: SaleWithItems[] = sales.map((sale) => ({
    customer: sale.customer,
    grandTotal: sale.grandTotal,
    paid: sale.paid,
    balance: sale.balance,
    status: sale.status,
    items: sale.items.map((item) => ({
      sku: item.sku,
      productName: item.productName,
      qty: item.qty,
      hppUnit: item.hppUnit,
      hargaUnit: item.hargaUnit,
      totalHpp: item.totalHpp,
      totalHarga: item.totalHarga,
    })),
  }));

  const txInputs = salesWithItems.map((sale) => ({
    grandTotal: sale.grandTotal,
    paid: sale.paid,
    balance: sale.balance,
    status: sale.status,
    metrics: computeTransactionMetrics({
      grandTotal: sale.grandTotal,
      items: sale.items.map((i) => ({
        hppUnit: i.hppUnit,
        hargaUnit: i.hargaUnit,
        qty: i.qty,
      })),
    }),
  }));

  const summary = computePeriodSummary(txInputs);
  const salesByCustomer = buildSalesByCustomer(salesWithItems);
  const salesByCategory = buildSalesByCategory(salesWithItems, snapshotMap);
  const topProducts = buildTopProducts(salesWithItems);

  const data: DashboardData = {
    summary,
    salesByCustomer,
    salesByCategory,
    topProducts,
  };

  return NextResponse.json(data);
}
