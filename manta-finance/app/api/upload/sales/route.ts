import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { parseSales } from "@/lib/parser/sales";
import { computeTransactionMetrics } from "@/lib/calculator/margin";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const valid = await validateSession(token);
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const periodId = searchParams.get("periodId");
  if (!periodId) {
    return NextResponse.json({ error: "periodId is required" }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  // Load product snapshots for name matching
  const snapshots = await prisma.productSnapshot.findMany({
    where: { periodId },
  });
  // Build lookup map: lowercase name → snapshot
  const snapshotMap = new Map(
    snapshots.map((s) => [s.name.toLowerCase().trim(), s])
  );

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const saleRows = parseSales(buffer);

  if (saleRows.length === 0) {
    return NextResponse.json({ error: "No sale rows found in file" }, { status: 400 });
  }

  const warnings: string[] = [];
  let savedCount = 0;

  // Delete existing sales for this period before re-import
  await prisma.sale.deleteMany({ where: { periodId } });

  for (const row of saleRows) {
    // Resolve items: match product name → get hppUnit and hargaUnit
    const resolvedItems = row.items.map((item) => {
      const snapshot = snapshotMap.get(item.productName.toLowerCase().trim());
      if (!snapshot) {
        warnings.push(`Unmatched product: "${item.productName}"`);
      }
      const hppUnit = snapshot?.hpp ?? 0;
      const hargaUnit = snapshot?.hargaJual ?? 0;
      return {
        productName: item.productName,
        sku: snapshot?.sku ?? "",
        qty: item.qty,
        hppUnit,
        hargaUnit,
        totalHpp: hppUnit * item.qty,
        totalHarga: hargaUnit * item.qty,
      };
    });

    // Compute transaction metrics (not stored — derived on read in Phase 3/4)
    computeTransactionMetrics({
      grandTotal: row.grandTotal,
      items: resolvedItems.map((i) => ({
        hppUnit: i.hppUnit,
        hargaUnit: i.hargaUnit,
        qty: i.qty,
      })),
    });

    const sale = await prisma.sale.create({
      data: {
        periodId,
        date: row.date,
        refNo: row.refNo,
        supplier: row.supplier,
        customer: row.customer,
        grandTotal: row.grandTotal,
        paid: row.paid,
        balance: row.balance,
        status: row.status,
      },
    });

    await prisma.saleItem.createMany({
      data: resolvedItems.map((item) => ({
        saleId: sale.id,
        sku: item.sku,
        productName: item.productName,
        qty: item.qty,
        hppUnit: item.hppUnit,
        hargaUnit: item.hargaUnit,
        totalHpp: item.totalHpp,
        totalHarga: item.totalHarga,
      })),
    });

    savedCount += 1;
  }

  // Deduplicate warnings
  const uniqueWarnings = Array.from(new Set(warnings));

  return NextResponse.json({
    count: savedCount,
    warnings: uniqueWarnings,
  });
}
