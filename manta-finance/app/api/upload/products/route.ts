import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { parseProducts } from "@/lib/parser/products";

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

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const rows = parseProducts(buffer);

  if (rows.length === 0) {
    return NextResponse.json({ error: "No product rows found in file" }, { status: 400 });
  }

  // Delete existing snapshots for this period before re-import
  await prisma.productSnapshot.deleteMany({ where: { periodId } });

  const created = await prisma.productSnapshot.createMany({
    data: rows.map((row) => ({
      periodId,
      sku: row.sku,
      name: row.name,
      category: row.category,
      hpp: row.hpp,
      hargaJual: row.hargaJual,
      stock: row.stock,
    })),
  });

  return NextResponse.json({ count: created.count });
}
