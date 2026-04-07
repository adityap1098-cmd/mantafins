import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const valid = await validateSession(token);
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const periods = await prisma.period.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return NextResponse.json({ periods });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const valid = await validateSession(token);
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, month, year } = body as {
    name: string;
    month: number;
    year: number;
  };

  if (!name || !month || !year) {
    return NextResponse.json(
      { error: "name, month, year are required" },
      { status: 400 }
    );
  }

  const period = await prisma.period.create({
    data: { name: name.trim(), month: Number(month), year: Number(year) },
  });

  return NextResponse.json({ period }, { status: 201 });
}


export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const valid = await validateSession(token);
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const periodId = searchParams.get("id");
  if (!periodId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    // Delete in correct order to respect foreign key constraints
    // 1. Find all sales for this period
    const sales = await prisma.sale.findMany({
      where: { periodId },
      select: { id: true },
    });
    const saleIds = sales.map((s) => s.id);

    // 2. Delete SaleItems for those sales
    if (saleIds.length > 0) {
      await prisma.saleItem.deleteMany({
        where: { saleId: { in: saleIds } },
      });
    }

    // 3. Delete PaymentLogs for those sales (no FK but keep data clean)
    if (saleIds.length > 0) {
      await prisma.paymentLog.deleteMany({
        where: { saleId: { in: saleIds } },
      });
    }

    // 4. Delete Sales
    await prisma.sale.deleteMany({ where: { periodId } });

    // 5. Delete ProductSnapshots
    await prisma.productSnapshot.deleteMany({ where: { periodId } });

    // 6. Delete OperationalCosts
    await prisma.operationalCost.deleteMany({ where: { periodId } });

    // 7. Delete the Period itself
    await prisma.period.delete({ where: { id: periodId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete period error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menghapus periode" },
      { status: 500 }
    );
  }
}
